import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../services/firebase';
import { cadastrarAnimal } from '../../services/animals';
import { Chip } from '../../components/Chip';
import { Toggle } from '../../components/Toggle';
import { formStyles } from '../../constants/formStyles';
import { theme } from '../../constants/theme';
import type {
  Especie,
  EspacoNecessario,
  NivelEnergia,
  Porte,
} from '../../types';

const URL_REGEX = /^https?:\/\/\S+$/;
const NOME_MIN = 2;
const DESCRICAO_MIN = 10;
const IDADE_MAX_MESES = 360;

const ESPECIES: ReadonlyArray<Especie> = ['cachorro', 'gato', 'outro'];
const PORTES: ReadonlyArray<Porte> = ['pequeno', 'medio', 'grande'];
const NIVEIS_ENERGIA: ReadonlyArray<NivelEnergia> = [1, 2, 3, 4, 5];
const ESPACOS: ReadonlyArray<EspacoNecessario> = [
  'apartamento',
  'casa_pequena',
  'casa_grande',
];

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
const LABEL_ESPACO: Record<EspacoNecessario, string> = {
  apartamento: 'Apartamento',
  casa_pequena: 'Casa pequena',
  casa_grande: 'Casa grande',
};

export default function CadastrarAnimalScreen() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState<Especie>('cachorro');
  const [idade, setIdade] = useState('');
  const [porte, setPorte] = useState<Porte>('medio');
  const [energia, setEnergia] = useState<NivelEnergia>(3);
  const [espaco, setEspaco] = useState<EspacoNecessario>('apartamento');
  const [sociavelCriancas, setSociavelCriancas] = useState(false);
  const [sociavelAnimais, setSociavelAnimais] = useState(false);
  const [fotoUrl, setFotoUrl] = useState('');
  const [descricao, setDescricao] = useState('');

  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const validar = (): string | null => {
    if (nome.trim().length < NOME_MIN) return 'Informe o nome do animal.';
    const idadeNum = Number(idade);
    if (
      !Number.isInteger(idadeNum) ||
      idadeNum <= 0 ||
      idadeNum > IDADE_MAX_MESES
    ) {
      return `Informe a idade em meses (1 a ${IDADE_MAX_MESES}).`;
    }
    if (!URL_REGEX.test(fotoUrl.trim())) {
      return 'Informe uma URL de foto válida (https://...).';
    }
    if (descricao.trim().length < DESCRICAO_MIN) {
      return `A descrição deve ter pelo menos ${DESCRICAO_MIN} caracteres.`;
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
    const ong_id = auth.currentUser?.uid;
    if (!ong_id) {
      setErro('Sessão expirada. Faça login novamente.');
      return;
    }
    setSalvando(true);
    try {
      await cadastrarAnimal({
        nome: nome.trim(),
        especie,
        idade: Number(idade),
        porte,
        energia,
        espaco_necessario: espaco,
        sociavel_criancas: sociavelCriancas,
        sociavel_animais: sociavelAnimais,
        foto_url: fotoUrl.trim(),
        descricao: descricao.trim(),
        ong_id,
        disponivel: true,
      });
      Alert.alert('Sucesso', 'Animal cadastrado com sucesso! 🐾', [
        { text: 'OK', onPress: () => router.replace('/(ong)/dashboard') },
      ]);
    } catch {
      setErro('Não foi possível cadastrar o animal. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={formStyles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={formStyles.titulo}>Novo animal</Text>

      <TextInput
        style={formStyles.input}
        placeholder="Nome"
        placeholderTextColor={theme.colors.placeholder}
        value={nome}
        onChangeText={setNome}
        editable={!salvando}
      />

      <Text style={formStyles.label}>Espécie</Text>
      <View style={formStyles.linha}>
        {ESPECIES.map((e) => (
          <Chip
            key={e}
            ativo={especie === e}
            texto={LABEL_ESPECIE[e]}
            onPress={() => setEspecie(e)}
          />
        ))}
      </View>

      <TextInput
        style={formStyles.input}
        placeholder="Idade em meses"
        placeholderTextColor={theme.colors.placeholder}
        keyboardType="numeric"
        value={idade}
        onChangeText={setIdade}
        editable={!salvando}
      />

      <Text style={formStyles.label}>Porte</Text>
      <View style={formStyles.linha}>
        {PORTES.map((p) => (
          <Chip
            key={p}
            ativo={porte === p}
            texto={LABEL_PORTE[p]}
            onPress={() => setPorte(p)}
          />
        ))}
      </View>

      <Text style={formStyles.label}>Energia (1 = calmo, 5 = agitado)</Text>
      <View style={formStyles.linha}>
        {NIVEIS_ENERGIA.map((n) => (
          <Chip
            key={n}
            ativo={energia === n}
            texto={String(n)}
            onPress={() => setEnergia(n)}
          />
        ))}
      </View>

      <Text style={formStyles.label}>Espaço necessário</Text>
      <View style={formStyles.linha}>
        {ESPACOS.map((e) => (
          <Chip
            key={e}
            ativo={espaco === e}
            texto={LABEL_ESPACO[e]}
            onPress={() => setEspaco(e)}
          />
        ))}
      </View>

      <Toggle
        valor={sociavelCriancas}
        texto="Sociável com crianças"
        onChange={setSociavelCriancas}
      />
      <Toggle
        valor={sociavelAnimais}
        texto="Sociável com outros animais"
        onChange={setSociavelAnimais}
      />

      <TextInput
        style={formStyles.input}
        placeholder="URL da foto (https://...)"
        placeholderTextColor={theme.colors.placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        value={fotoUrl}
        onChangeText={setFotoUrl}
        editable={!salvando}
      />

      <TextInput
        style={styles.textarea}
        placeholder="Descrição"
        placeholderTextColor={theme.colors.placeholder}
        multiline
        value={descricao}
        onChangeText={setDescricao}
        editable={!salvando}
      />

      {erro ? <Text style={formStyles.erro}>{erro}</Text> : null}

      <TouchableOpacity
        style={formStyles.botao}
        onPress={handleSubmit}
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <Text style={formStyles.botaoTexto}>Cadastrar animal</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoSec}
        onPress={() => router.back()}
        disabled={salvando}
      >
        <Text style={styles.botaoSecTexto}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  textarea: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: theme.spacing.md - 2,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  botaoSec: {
    padding: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  botaoSecTexto: {
    color: theme.colors.muted,
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.label + 2,
  },
});
