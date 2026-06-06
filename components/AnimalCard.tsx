import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import type { Animal, Especie, Porte } from '../types';

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

type Props = {
  animal: Animal;
};

export function AnimalCard({ animal }: Props) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: animal.foto_url }} style={styles.foto} />
      <View style={styles.info}>
        <Text style={styles.nome}>{animal.nome}</Text>
        <Text style={styles.meta}>
          {LABEL_ESPECIE[animal.especie]} · {LABEL_PORTE[animal.porte]}
        </Text>
        <Link href={`/(adotante)/animal/${animal.id}`} asChild>
          <TouchableOpacity style={styles.botao}>
            <Text style={styles.botaoTexto}>Ver detalhes</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#F7F7F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  foto: {
    width: 112,
    height: 112,
    backgroundColor: '#E5E7EB',
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
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
  botao: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FF7A59',
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
