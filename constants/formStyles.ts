import { StyleSheet } from 'react-native';
import { theme } from './theme';

/**
 * Estilos comuns a telas de formulário simples (login, cadastro,
 * cadastro de animal). Antes duplicados em cada arquivo com
 * valores hexadecimais fixos em vez dos tokens de `theme`.
 */
export const formStyles = StyleSheet.create({
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
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.font.body,
    fontWeight: theme.weight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  linha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: theme.spacing.md - 2,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  erro: {
    color: theme.colors.danger,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  botao: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl - 4,
  },
  botaoTexto: {
    color: theme.colors.white,
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.subtitle,
  },
  link: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    color: theme.colors.primary,
  },
});
