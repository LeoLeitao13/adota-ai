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
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { auth } from '../../services/firebase';
import { atualizarAnimal, listarAnimaisPorONG } from '../../services/animals';
import { logout } from '../../services/auth';
import { BotaoSair } from '../../components/BotaoSair';
import type { Animal, Especie, Porte } from '../../types';

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

export default function DashboardScreen() {
  const router = useRouter();
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSair = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const carregar = useCallback(async () => {
    const ong_id = auth.currentUser?.uid;
    if (!ong_id) {
      setCarregando(false);
      setAtualizando(false);
      return;
    }
    setErro(null);
    try {
      const lista = await listarAnimaisPorONG(ong_id);
      lista.sort((a, b) => b.criado_em.getTime() - a.criado_em.getTime());
      setAnimais(lista);
    } catch {
      setErro('Não foi possível carregar os animais.');
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

  const marcarIndisponivel = async (id: string) => {
    try {
      await atualizarAnimal(id, { disponivel: false });
      setAnimais((atual) =>
        atual.map((a) => (a.id === id ? { ...a, disponivel: false } : a)),
      );
    } catch {
      setErro('Não foi possível atualizar o animal.');
    }
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
          <Text style={styles.titulo}>Meus animais</Text>
          <Text style={styles.contador}>
            {animais.length}{' '}
            {animais.length === 1 ? 'animal cadastrado' : 'animais cadastrados'}
          </Text>
        </View>
        <BotaoSair onPress={handleSair} />
      </View>

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <FlatList
        data={animais}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.meta}>
                {LABEL_ESPECIE[item.especie]} · {item.idade}{' '}
                {item.idade === 1 ? 'mês' : 'meses'} · {LABEL_PORTE[item.porte]}
              </Text>
              <Text style={item.disponivel ? styles.statusOk : styles.statusOff}>
                {item.disponivel ? 'Disponível' : 'Indisponível'}
              </Text>
            </View>
            {item.disponivel ? (
              <TouchableOpacity
                style={styles.botaoSec}
                onPress={() => void marcarIndisponivel(item.id)}
              >
                <Text style={styles.botaoSecTexto}>Indisponibilizar</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            Você ainda não cadastrou nenhum animal.
          </Text>
        }
        refreshControl={
          <RefreshControl refreshing={atualizando} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.lista}
      />

      <Link href="/(ong)/cadastrar-animal" asChild>
        <TouchableOpacity style={styles.botaoFlutuante}>
          <Text style={styles.botaoFlutuanteTexto}>+ Novo animal</Text>
        </TouchableOpacity>
      </Link>
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
  contador: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  erro: {
    color: '#E11D48',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  lista: {
    paddingHorizontal: 24,
    paddingBottom: 96,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardInfo: {
    flex: 1,
  },
  nome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  meta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statusOk: {
    marginTop: 6,
    fontSize: 13,
    color: '#16A34A',
    fontWeight: '600',
  },
  statusOff: {
    marginTop: 6,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  botaoSec: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF7A59',
  },
  botaoSecTexto: {
    color: '#FF7A59',
    fontSize: 13,
    fontWeight: '600',
  },
  vazio: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 32,
  },
  botaoFlutuante: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#FF7A59',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  botaoFlutuanteTexto: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
