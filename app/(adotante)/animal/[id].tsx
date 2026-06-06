import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth } from '../../../services/firebase';
import { buscarAnimal, registrarInteresse } from '../../../services/animals';
import { ANIMAIS_DEMO } from '../../../services/demo-animais';
import type { Animal, Especie, EspacoNecessario, Porte } from '../../../types';

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

export default function AnimalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setCarregando(false);
      return;
    }
    void (async () => {
      try {
        const doFirestore = await buscarAnimal(id);
        if (doFirestore) {
          setAnimal(doFirestore);
          return;
        }
        const doDemo = ANIMAIS_DEMO.find((a) => a.id === id) ?? null;
        setAnimal(doDemo);
      } catch {
        setErro('Não foi possível carregar o animal.');
      } finally {
        setCarregando(false);
      }
    })();
  }, [id]);

  const handleInteresse = async () => {
    if (!animal) return;
    const adotanteId = auth.currentUser?.uid;
    if (!adotanteId) {
      setErro('Sessão expirada. Faça login novamente.');
      return;
    }
    setSalvando(true);
    try {
      await registrarInteresse(adotanteId, animal.id);
      Alert.alert(
        'Interesse registrado',
        'A ONG receberá seu contato em breve.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch {
      setErro('Não foi possível registrar seu interesse. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#FF7A59" />
      </View>
    );
  }

  if (!animal) {
    return (
      <View style={styles.centro}>
        <Text style={styles.vazio}>Animal não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: animal.foto_url }} style={styles.foto} />

      <Text style={styles.titulo}>{animal.nome}</Text>
      <Text style={styles.meta}>
        {LABEL_ESPECIE[animal.especie]} · {LABEL_PORTE[animal.porte]} ·{' '}
        {animal.idade} {animal.idade === 1 ? 'mês' : 'meses'}
      </Text>

      <Linha rotulo="Energia" valor={`${animal.energia} / 5`} />
      <Linha
        rotulo="Espaço ideal"
        valor={LABEL_ESPACO[animal.espaco_necessario]}
      />
      <Linha
        rotulo="Sociável com crianças"
        valor={animal.sociavel_criancas ? 'Sim' : 'Não'}
      />
      <Linha
        rotulo="Sociável com outros animais"
        valor={animal.sociavel_animais ? 'Sim' : 'Não'}
      />

      <Text style={styles.label}>Sobre</Text>
      <Text style={styles.descricao}>{animal.descricao}</Text>

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <TouchableOpacity
        style={
          animal.disponivel && !salvando ? styles.botao : styles.botaoDesabilitado
        }
        onPress={handleInteresse}
        disabled={salvando || !animal.disponivel}
      >
        {salvando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.botaoTexto}>
            {animal.disponivel ? 'Tenho interesse' : 'Animal indisponível'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoSec} onPress={() => router.back()}>
        <Text style={styles.botaoSecTexto}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

type LinhaProps = {
  rotulo: string;
  valor: string;
};

function Linha({ rotulo, valor }: LinhaProps) {
  return (
    <View style={styles.linha}>
      <Text style={styles.linhaRotulo}>{rotulo}</Text>
      <Text style={styles.linhaValor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  container: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 48,
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
  },
  foto: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  meta: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 12,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  linhaRotulo: {
    color: '#6B7280',
    fontSize: 14,
  },
  linhaValor: {
    color: '#1C1C1E',
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    marginTop: 20,
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  descricao: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 22,
  },
  erro: {
    color: '#E11D48',
    marginTop: 16,
  },
  botao: {
    backgroundColor: '#FF7A59',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  botaoDesabilitado: {
    backgroundColor: '#9CA3AF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
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
  vazio: {
    textAlign: 'center',
    color: '#6B7280',
  },
});
