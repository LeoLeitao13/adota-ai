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
      setErro(mensagemErroCadastro(e));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>Criar conta</Text>

      <Text style={styles.label}>Sou…</Text>
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
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#9CA3AF"
        value={nome}
        onChangeText={setNome}
        editable={!carregando}
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#9CA3AF"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
        editable={!carregando}
      />
      <TextInput
        style={styles.input}
        placeholder={`Senha (mín. ${SENHA_MIN} caracteres)`}
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
        editable={!carregando}
      />

      {tipo === 'adotante' ? (
        <View>
          <Text style={styles.label}>Estilo de vida</Text>
          <View style={styles.linha}>
            {ESTILOS_VIDA.map((e) => (
              <Chip
                key={e}
                ativo={estiloVida === e}
                texto={LABEL_ESTILO[e]}
                onPress={() => setEstiloVida(e)}
              />
            ))}
          </View>

          <Text style={styles.label}>Moradia</Text>
          <View style={styles.linha}>
            {MORADIAS.map((m) => (
              <Chip
                key={m}
                ativo={moradia === m}
                texto={LABEL_MORADIA[m]}
                onPress={() => setMoradia(m)}
              />
            ))}
          </View>

          <Text style={styles.label}>Tempo disponível (1 = pouco, 5 = muito)</Text>
          <View style={styles.linha}>
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

          <Text style={styles.label}>Espécie preferida</Text>
          <View style={styles.linha}>
            {ESPECIES.map((e) => (
              <Chip
                key={e}
                ativo={prefEspecie === e}
                texto={LABEL_ESPECIE[e]}
                onPress={() => setPrefEspecie(e)}
              />
            ))}
          </View>

          <Text style={styles.label}>Porte preferido</Text>
          <View style={styles.linha}>
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
            style={styles.input}
            placeholder="Nome da ONG"
            placeholderTextColor="#9CA3AF"
            value={nomeOng}
            onChangeText={setNomeOng}
            editable={!carregando}
          />
          <TextInput
            style={styles.input}
            placeholder="CNPJ (XX.XXX.XXX/XXXX-XX)"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={cnpj}
            onChangeText={(v) => setCnpj(aplicarMascaraCNPJ(v))}
            editable={!carregando}
            maxLength={18}
          />
          <TextInput
            style={styles.input}
            placeholder="Telefone (XX) XXXXX-XXXX"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={telefone}
            onChangeText={(v) => setTelefone(aplicarMascaraTelefone(v))}
            editable={!carregando}
            maxLength={16}
          />
        </View>
      )}

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <TouchableOpacity
        style={styles.botao}
        onPress={handleSubmit}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.botaoTexto}>Cadastrar</Text>
        )}
      </TouchableOpacity>

      <Link href="/(auth)/login" style={styles.link}>
        Já tenho conta
      </Link>
    </ScrollView>
  );
}

type ChipProps = {
  ativo: boolean;
  texto: string;
  onPress: () => void;
};

function Chip({ ativo, texto, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      style={ativo ? styles.chipAtivo : styles.chip}
      onPress={onPress}
    >
      <Text style={ativo ? styles.chipTextoAtivo : styles.chipTexto}>
        {texto}
      </Text>
    </TouchableOpacity>
  );
}

type ToggleProps = {
  valor: boolean;
  texto: string;
  onChange: (v: boolean) => void;
};

function Toggle({ valor, texto, onChange }: ToggleProps) {
  return (
    <TouchableOpacity style={styles.toggle} onPress={() => onChange(!valor)}>
      <View style={valor ? styles.checkboxAtivo : styles.checkbox} />
      <Text style={styles.toggleTexto}>{texto}</Text>
    </TouchableOpacity>
  );
}

function mensagemErroCadastro(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'code' in e) {
    const code = String((e as { code: unknown }).code);
    if (code === 'auth/email-already-in-use') return 'Este e-mail já está cadastrado.';
    if (code === 'auth/invalid-email') return 'E-mail inválido.';
    if (code === 'auth/weak-password') return 'Senha muito fraca.';
    if (code === 'auth/network-request-failed') {
      return 'Falha de conexão. Verifique sua internet.';
    }
  }
  return 'Não foi possível concluir o cadastro. Tente novamente.';
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 48,
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 12,
    marginBottom: 8,
  },
  tipoSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  tipoBotao: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F7F7F8',
    alignItems: 'center',
  },
  tipoBotaoAtivo: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF7A59',
    backgroundColor: '#FFF1EC',
    alignItems: 'center',
  },
  tipoTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  tipoTextoAtivo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF7A59',
  },
  tipoLegenda: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  tipoLegendaAtiva: {
    fontSize: 12,
    color: '#FF7A59',
    marginTop: 4,
    textAlign: 'center',
  },
  linha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#F7F7F8',
    color: '#1C1C1E',
  },
  erro: {
    color: '#E11D48',
    marginTop: 12,
    marginBottom: 4,
  },
  botao: {
    backgroundColor: '#FF7A59',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  link: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#FF7A59',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F7F7F8',
  },
  chipAtivo: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FF7A59',
    backgroundColor: '#FF7A59',
  },
  chipTexto: {
    color: '#1C1C1E',
  },
  chipTextoAtivo: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  toggleTexto: {
    color: '#1C1C1E',
    fontSize: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FF7A59',
    backgroundColor: 'transparent',
  },
  checkboxAtivo: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FF7A59',
    backgroundColor: '#FF7A59',
  },
});
