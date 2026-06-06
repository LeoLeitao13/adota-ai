import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserAtual } from '../services/auth';
import type { User } from '../types';

export default function RootLayout() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUsuario(null);
      } else {
        try {
          setUsuario(await getUserAtual());
        } catch {
          setUsuario(null);
        }
      }
      setCarregando(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (carregando) return;
    const naTelaAuth = segments[0] === '(auth)';
    if (!usuario && !naTelaAuth) {
      router.replace('/(auth)/login');
    } else if (usuario && naTelaAuth) {
      if (usuario.tipo === 'ong') {
        router.replace('/(ong)/dashboard');
      } else {
        router.replace('/(adotante)/home');
      }
    }
  }, [carregando, usuario, segments, router]);

  if (carregando) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator size="large" color="#FF7A59" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  carregando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
