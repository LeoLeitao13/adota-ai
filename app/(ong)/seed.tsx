import { Fragment, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { runSeed, type SeedResult } from '../../scripts/seed';
import { theme } from '../../constants/theme';

export default function SeedScreen() {
  const [executando, setExecutando] = useState(false);
  const [resultado, setResultado] = useState<SeedResult | null>(null);

  const confirmar = () => {
    Alert.alert(
      'Popular banco?',
      'Vai criar 2 ONGs, 10 animais e 2 adotantes de teste. Sua sessão atual será encerrada.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Popular', onPress: executar },
      ],
    );
  };

  const executar = async () => {
    setExecutando(true);
    setResultado(null);
    try {
      const r = await runSeed();
      setResultado(r);
    } finally {
      setExecutando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Seed do banco</Text>
      <Text style={styles.subtitulo}>
        Tela temporária para popular o Firestore com dados de teste.
      </Text>

      <View style={styles.bloco}>
        <Text style={styles.label}>O que será criado</Text>
        <Text style={styles.linha}>• 2 ONGs (senha: teste123)</Text>
        <Text style={styles.linha}>• 10 animais distribuídos entre elas</Text>
        <Text style={styles.linha}>• 2 adotantes com perfis opostos</Text>
      </View>

      <TouchableOpacity
        style={executando ? styles.botaoDesabilitado : styles.botao}
        onPress={confirmar}
        disabled={executando}
      >
        {executando ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <Text style={styles.botaoTexto}>Popular banco de dados</Text>
        )}
      </TouchableOpacity>

      {resultado ? <Resultado resultado={resultado} /> : null}
    </ScrollView>
  );
}

type ResultadoProps = {
  resultado: SeedResult;
};

function contarCriados(arr: ReadonlyArray<boolean>): number {
  return arr.filter(Boolean).length;
}

function Resultado({ resultado }: ResultadoProps) {
  const sucesso = resultado.erros.length === 0;
  return (
    <View style={sucesso ? styles.resultadoOk : styles.resultadoErro}>
      <Text style={styles.resultadoTitulo}>
        {sucesso ? 'Concluído' : 'Concluído com avisos'}
      </Text>

      <Text style={styles.label}>ONGs ({resultado.ongs.length})</Text>
      {resultado.ongs.map((ong) => (
        <Text key={ong.uid} style={styles.item}>
          {ong.criado ? '✓ criada' : '↻ já existia'} · {ong.email}
        </Text>
      ))}

      <Text style={styles.label}>Animais ({resultado.animais.length})</Text>
      <Text style={styles.item}>
        {contarCriados(resultado.animais.map((a) => a.criado))} criados ·{' '}
        {resultado.animais.length -
          contarCriados(resultado.animais.map((a) => a.criado))}{' '}
        já existiam
      </Text>

      <Text style={styles.label}>Adotantes ({resultado.adotantes.length})</Text>
      {resultado.adotantes.map((a) => (
        <Text key={a.uid} style={styles.item}>
          {a.criado ? '✓ criado' : '↻ já existia'} · {a.email}
        </Text>
      ))}

      {resultado.erros.length > 0 ? (
        <Fragment>
          <Text style={styles.labelErro}>Erros ({resultado.erros.length})</Text>
          {resultado.erros.map((e, i) => (
            <Text key={i} style={styles.itemErro}>
              • {e}
            </Text>
          ))}
        </Fragment>
      ) : null}

      <Text style={styles.aviso}>
        Sua sessão foi encerrada. Faça login novamente com qualquer conta
        (senha: teste123). Pode rodar este seed quantas vezes quiser — só cria
        o que ainda não existe.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.xxxl,
    backgroundColor: theme.colors.background,
    flexGrow: 1,
  },
  titulo: {
    fontSize: theme.font.title,
    fontWeight: theme.weight.bold,
    color: theme.colors.text,
  },
  subtitulo: {
    fontSize: theme.font.body,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  bloco: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  label: {
    fontSize: theme.font.label,
    fontWeight: theme.weight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  labelErro: {
    fontSize: theme.font.label,
    fontWeight: theme.weight.semibold,
    color: theme.colors.danger,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  linha: {
    fontSize: theme.font.body,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  item: {
    fontSize: theme.font.body,
    color: theme.colors.text,
    marginTop: 2,
  },
  itemErro: {
    fontSize: theme.font.label,
    color: theme.colors.danger,
    marginTop: 2,
  },
  botao: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  botaoDesabilitado: {
    backgroundColor: theme.colors.placeholder,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  botaoTexto: {
    color: theme.colors.white,
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.subtitle,
  },
  resultadoOk: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.success,
    backgroundColor: '#F0FDF4',
  },
  resultadoErro: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    backgroundColor: '#FEF2F2',
  },
  resultadoTitulo: {
    fontSize: theme.font.subtitle,
    fontWeight: theme.weight.bold,
    color: theme.colors.text,
  },
  aviso: {
    marginTop: theme.spacing.lg,
    fontSize: theme.font.label,
    color: theme.colors.muted,
    fontStyle: 'italic',
  },
});
