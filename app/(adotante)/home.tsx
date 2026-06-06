import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { AnimalCard } from '../../components/AnimalCard';
import { BotaoSair } from '../../components/BotaoSair';
import { getUserAtual, logout } from '../../services/auth';
import { listarAnimaisDisponiveis } from '../../services/animals';
import { ANIMAIS_DEMO } from '../../services/demo-animais';
import { recomendar } from '../../services/knn';
import type { Animal, PerfilAdotante } from '../../types';

const TOP_K = 5;

export default function HomeScreen() {
  const router = useRouter();
  const [recomendados, setRecomendados] = useState<Animal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [usouFallback, setUsouFallback] = useState(false);

  const handleSair = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const [usuario, animaisFirestore] = await Promise.all([
        getUserAtual(),
        listarAnimaisDisponiveis(),
      ]);

      console.log('Animais do Firestore:', animaisFirestore.length);

      const idsFirestore = new Set(animaisFirestore.map((a) => a.id));
      const demoExtras = ANIMAIS_DEMO.filter(
        (a) => !idsFirestore.has(a.id),
      );
      const animais: Animal[] = [...animaisFirestore, ...demoExtras];
      console.log(
        `Pool total: ${animais.length} ` +
          `(${animaisFirestore.length} reais + ${demoExtras.length} demo)`,
      );

      const perfil =
        usuario && usuario.tipo === 'adotante' ? usuario : null;
      console.log('Perfil adotante:', perfil);

      if (!perfil || !perfilEhCompleto(perfil)) {
        setUsouFallback(true);
        setRecomendados(animais);
        return;
      }

      setUsouFallback(false);
      setRecomendados(recomendar(perfil, animais, TOP_K));
    } catch (e) {
      console.error('Erro ao carregar home:', e);
      setErro('Não foi possível carregar os animais. Tente novamente.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void carregar();
    }, [carregar]),
  );

  const handleRefresh = () => {
    setAtualizando(true);
    void carregar();
  };

  const handleRecarregar = () => {
    setCarregando(true);
    void carregar();
  };

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#FF7A59" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <View style={styles.cabecalhoInfo}>
          <Text style={styles.titulo}>Recomendados para você</Text>
          <Text style={styles.subtitulo}>
            {usouFallback
              ? 'Mostrando todos os animais disponíveis'
              : `Top ${TOP_K} mais compatíveis com seu perfil (KNN)`}
          </Text>
        </View>
        <BotaoSair onPress={handleSair} />
      </View>

      {erro ? (
        <View style={styles.erroBox}>
          <Text style={styles.erroTexto}>{erro}</Text>
          <TouchableOpacity
            style={styles.botaoRecarregar}
            onPress={handleRecarregar}
          >
            <Text style={styles.botaoRecarregarTexto}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={recomendados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AnimalCard animal={item} />}
        ItemSeparatorComponent={Separador}
        ListEmptyComponent={
          erro ? null : (
            <Text style={styles.vazio}>
              Nenhum animal disponível para adoção no momento.
            </Text>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={handleRefresh}
            tintColor="#FF7A59"
          />
        }
        contentContainerStyle={styles.lista}
      />
    </View>
  );
}

/**
 * Verifica se o perfil tem todos os campos que o KNN consome.
 * Defesa contra documentos parciais no Firestore — sem isso, o
 * algoritmo poderia produzir NaN ou crashar.
 */
function perfilEhCompleto(perfil: PerfilAdotante): boolean {
  return (
    perfil.estilo_vida != null &&
    perfil.moradia != null &&
    typeof perfil.tempo_disponivel === 'number' &&
    typeof perfil.tem_criancas === 'boolean' &&
    typeof perfil.tem_animais === 'boolean'
  );
}

function Separador() {
  return <View style={styles.separador} />;
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
  },
  cabecalho: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cabecalhoInfo: {
    flex: 1,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  subtitulo: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  erroBox: {
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
  },
  erroTexto: {
    color: '#E11D48',
    textAlign: 'center',
    marginBottom: 12,
  },
  botaoRecarregar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FF7A59',
  },
  botaoRecarregarTexto: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  lista: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  separador: {
    height: 12,
  },
  vazio: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 32,
  },
});
