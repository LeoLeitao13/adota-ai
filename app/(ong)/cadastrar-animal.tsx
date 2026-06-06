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
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>Novo animal</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#9CA3AF"
        value={nome}
        onChangeText={setNome}
        editable={!salvando}
      />

      <Text style={styles.label}>Espécie</Text>
      <View style={styles.linha}>
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
        style={styles.input}
        placeholder="Idade em meses"
        placeholderTextColor="#9CA3AF"
        keyboardType="numeric"
        value={idade}
        onChangeText={setIdade}
        editable={!salvando}
      />

      <Text style={styles.label}>Porte</Text>
      <View style={styles.linha}>
        {PORTES.map((p) => (
          <Chip
            key={p}
            ativo={porte === p}
            texto={LABEL_PORTE[p]}
            onPress={() => setPorte(p)}
          />
        ))}
      </View>

      <Text style={styles.label}>Energia (1 = calmo, 5 = agitado)</Text>
      <View style={styles.linha}>
        {NIVEIS_ENERGIA.map((n) => (
          <Chip
            key={n}
            ativo={energia === n}
            texto={String(n)}
            onPress={() => setEnergia(n)}
          />
        ))}
      </View>

      <Text style={styles.label}>Espaço necessário</Text>
      <View style={styles.linha}>
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
        style={styles.input}
        placeholder="URL da foto (https://...)"
        placeholderTextColor="#9CA3AF"
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
        placeholderTextColor="#9CA3AF"
        multiline
        value={descricao}
        onChangeText={setDescricao}
        editable={!salvando}
      />

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <TouchableOpacity
        style={styles.botao}
        onPress={handleSubmit}
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.botaoTexto}>Cadastrar animal</Text>
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

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 48,
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
  },
  titulo: {
    fontSize: 24,
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
  textarea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#F7F7F8',
    color: '#1C1C1E',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  erro: {
    color: '#E11D48',
    marginTop: 12,
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
  botaoSec: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  botaoSecTexto: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 15,
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
