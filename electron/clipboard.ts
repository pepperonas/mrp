import { clipboard } from 'electron';

export const readClipboard = (): string => {
  return clipboard.readText();
};

export const writeClipboard = (text: string): void => {
  clipboard.writeText(text);
};

