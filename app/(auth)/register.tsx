import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { cadastrarAdotante, cadastrarONG } from '../../services/auth';
import { mensagemErroFirebase } from '../../services/firebase-errors';
import {
  aplicarMascaraCNPJ,
  aplicarMascaraTelefone,
  NOME_MIN,
  SENHA_MIN,
  validarCNPJ,
  validarEmail,
  validarSenha,
  validarTelefone,
} from '../../services/validacoes';
import { Chip } from '../../components/Chip';
import { Toggle } from '../../components/Toggle';
import { formStyles } from '../../constants/formStyles';
import { theme } from '../../constants/theme';
import type {
  Especie,
  EspacoNecessario,
  EstiloVida,
  NivelTempoDisponivel,
  Porte,
  TipoUsuario,
} from '../../types';

const ESTILOS_VIDA: ReadonlyArray<EstiloVida> = ['sedentario', 'moderado', 'ativo'];
const MORADIAS: ReadonlyArray<EspacoNecessario> = [
  'apartamento',
  'casa_pequena',
  'casa_grande',
];
const NIVEIS_TEMPO: ReadonlyArray<NivelTempoDisponivel> = [1, 2, 3, 4, 5];
const ESPECIES: ReadonlyArray<Especie> = ['cachorro', 'gato', 'outro'];
const PORTES: ReadonlyArray<Porte> = ['pequeno', 'medio', 'grande'];

const LABEL_ESTILO: Record<EstiloVida, string> = {
  sedentario: 'Sedentário',
  moderado: 'Moderado',
  ativo: 'Ativo',
};
const LABEL_MORADIA: Record<EspacoNecessario, string> = {
  apartamento: 'Apartamento',
  casa_pequena: 'Casa pequena',
  casa_grande: 'Casa grande',
};
const LABEL_ESPECIE: Record<Especie, string> = {
  cachorro: 'Cachorro',
  gato: 'Gato',
  outro: 'Outro',
};
const LABEL_PORTE: Record<Porte, string> = {
  pequeno: 'Pequeno',
  medio: 'Médio',
  grande: 'Grande',
};

export default function RegisterScreen() {
  const router = useRouter();

  const [tipo, setTipo] = useState<TipoUsuario>('adotante');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [estiloVida, setEstiloVida] = useState<EstiloVida>('moderado');
  const [moradia, setMoradia] = useState<EspacoNecessario>('apartamento');
  const [tempoDisponivel, setTempoDisponivel] = useState<NivelTempoDisponivel>(3);
  const [temCriancas, setTemCriancas] = useState(false);
  const [temAnimais, setTemAnimais] = useState(false);
  const [prefEspecie, setPrefEspecie] = useState<Especie>('cachorro');
  const [prefPorte, setPrefPorte] = useState<Porte>('medio');

  const [nomeOng, setNomeOng] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [telefone, setTelefone] = useState('');

  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const validar = (): string | null => {
    if (nome.trim().length < NOME_MIN) return 'Informe seu nome.';
    if (!validarEmail(email)) return 'Informe um e-mail válido.';
    if (!validarSenha(senha)) {
      return `A senha deve ter pelo menos ${SENHA_MIN} caracteres.`;
    }
    if (tipo === 'ong') {
      if (nomeOng.trim().length < NOME_MIN) return 'Informe o nome da ONG.';
      if (!validarCNPJ(cnpj)) {
        return 'CNPJ inválido. Use o formato XX.XXX.XXX/XXXX-XX.';
      }
      if (!validarTelefone(telefone)) {
        return 'Telefone inválido. Use o formato (XX) XXXXX-XXXX.';
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    setErro(null);
    const v = validar();
    if (v) {
      setErro(v);
      return;
    }
    setCarregando(true);
    try {
      if (tipo === 'adotante') {
        await cadastrarAdotante(email.trim(), senha, {
          nome: nome.trim(),
          estilo_vida: estiloVida,
          moradia,
          tempo_disponivel: tempoDisponivel,
          tem_criancas: temCriancas,
          tem_animais: temAnimais,
          preferencia_especie: prefEspecie,
          preferencia_porte: prefPorte,
        });
        router.replace('/(adotante)/home');
      } else {
        await cadastrarONG(email.trim(), senha, {
          nome: nome.trim(),
          nome_ong: nomeOng.trim(),
          cnpj,
          telefone,
        });
        router.replace('/(ong)/dashboard');
      }
    } catch (e) {
      setErro(mensagemErroFirebase(e, 'cadastro'));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={formStyles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={formStyles.titulo}>Criar conta</Text>

      <Text style={formStyles.label}>Sou…</Text>
      <View style={styles.tipoSelector}>
        <TouchableOpacity
          style={tipo === 'adotante' ? styles.tipoBotaoAtivo : styles.tipoBotao}
          onPress={() => setTipo('adotante')}
          disabled={carregando}
        >
          <Text
            style={
              tipo === 'adotante' ? styles.tipoTextoAtivo : styles.tipoTexto
            }
          >
            Adotante
          </Text>
          <Text
            style={
              tipo === 'adotante'
                ? styles.tipoLegendaAtiva
                : styles.tipoLegenda
            }
          >
            Quero adotar um animal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={tipo === 'ong' ? styles.tipoBotaoAtivo : styles.tipoBotao}
          onPress={() => setTipo('ong')}
          disabled={carregando}
        >
          <Text
            style={tipo === 'ong' ? styles.tipoTextoAtivo : styles.tipoTexto}
          >
            ONG
          </Text>
          <Text
            style={
              tipo === 'ong' ? styles.tipoLegendaAtiva : styles.tipoLegenda
            }
          >
            Cadastro animais para adoção
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={formStyles.input}
        placeholder="Nome"
        placeholderTextColor={theme.colors.placeholder}
        value={nome}
        onChangeText={setNome}
        editable={!carregando}
      />
      <TextInput
        style={formStyles.input}
        placeholder="E-mail"
        placeholderTextColor={theme.colors.placeholder}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
        editable={!carregando}
      />
      <TextInput
        style={formStyles.input}
        placeholder={`Senha (mín. ${SENHA_MIN} caracteres)`}
        placeholderTextColor={theme.colors.placeholder}
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
        editable={!carregando}
      />

      {tipo === 'adotante' ? (
        <View>
          <Text style={formStyles.label}>Estilo de vida</Text>
          <View style={formStyles.linha}>
            {ESTILOS_VIDA.map((e) => (
              <Chip
                key={e}
                ativo={estiloVida === e}
                texto={LABEL_ESTILO[e]}
                onPress={() => setEstiloVida(e)}
              />
            ))}
          </View>

          <Text style={formStyles.label}>Moradia</Text>
          <View style={formStyles.linha}>
            {MORADIAS.map((m) => (
              <Chip
                key={m}
                ativo={moradia === m}
                texto={LABEL_MORADIA[m]}
                onPress={() => setMoradia(m)}
              />
            ))}
          </View>

          <Text style={formStyles.label}>
            Tempo disponível (1 = pouco, 5 = muito)
          </Text>
          <View style={formStyles.linha}>
            {NIVEIS_TEMPO.map((n) => (
              <Chip
                key={n}
                ativo={tempoDisponivel === n}
                texto={String(n)}
                onPress={() => setTempoDisponivel(n)}
              />
            ))}
          </View>

          <Toggle
            valor={temCriancas}
            texto="Tenho crianças em casa"
            onChange={setTemCriancas}
          />
          <Toggle
            valor={temAnimais}
            texto="Já tenho outros animais"
            onChange={setTemAnimais}
          />

          <Text style={formStyles.label}>Espécie preferida</Text>
          <View style={formStyles.linha}>
            {ESPECIES.map((e) => (
              <Chip
                key={e}
                ativo={prefEspecie === e}
                texto={LABEL_ESPECIE[e]}
                onPress={() => setPrefEspecie(e)}
              />
            ))}
          </View>

          <Text style={formStyles.label}>Porte preferido</Text>
          <View style={formStyles.linha}>
            {PORTES.map((p) => (
              <Chip
                key={p}
                ativo={prefPorte === p}
                texto={LABEL_PORTE[p]}
                onPress={() => setPrefPorte(p)}
              />
            ))}
          </View>
        </View>
      ) : (
        <View>
          <TextInput
            style={formStyles.input}
            placeholder="Nome da ONG"
            placeholderTextColor={theme.colors.placeholder}
            value={nomeOng}
            onChangeText={setNomeOng}
            editable={!carregando}
          />
          <TextInput
            style={formStyles.input}
            placeholder="CNPJ (XX.XXX.XXX/XXXX-XX)"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="numeric"
            value={cnpj}
            onChangeText={(v) => setCnpj(aplicarMascaraCNPJ(v))}
            editable={!carregando}
            maxLength={18}
          />
          <TextInput
            style={formStyles.input}
            placeholder="Telefone (XX) XXXXX-XXXX"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="phone-pad"
            value={telefone}
            onChangeText={(v) => setTelefone(aplicarMascaraTelefone(v))}
            editable={!carregando}
            maxLength={16}
          />
        </View>
      )}

      {erro ? <Text style={formStyles.erro}>{erro}</Text> : null}

      <TouchableOpacity
        style={formStyles.botao}
        onPress={handleSubmit}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <Text style={formStyles.botaoTexto}>Cadastrar</Text>
        )}
      </TouchableOpacity>

      <Link href="/(auth)/login" style={formStyles.link}>
        Já tenho conta
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tipoSelector: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  tipoBotao: {
    flex: 1,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  tipoBotaoAtivo: {
    flex: 1,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
  },
  tipoTexto: {
    fontSize: theme.font.subtitle,
    fontWeight: theme.weight.semibold,
    color: theme.colors.text,
  },
  tipoTextoAtivo: {
    fontSize: theme.font.subtitle,
    fontWeight: theme.weight.bold,
    color: theme.colors.primary,
  },
  tipoLegenda: {
    fontSize: theme.font.caption,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  tipoLegendaAtiva: {
    fontSize: theme.font.caption,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});
