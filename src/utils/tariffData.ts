export interface TariffRegion {
  name: string;
  minTariff: number;
  maxTariff: number;
}

export const regionalTariffs: TariffRegion[] = [
  { name: "Sudeste", minTariff: 1.484, maxTariff: 0.578 },
  { name: "Sul", minTariff: 1.033, maxTariff: 0.413 },
  { name: "Nordeste", minTariff: 1.044, maxTariff: 0.588 },
  { name: "Norte", minTariff: 0.938, maxTariff: 0.641 },
  { name: "Centro-Oeste", minTariff: 0.878, maxTariff: 0.678 },
];

// Função mock para simular a obtenção da região a partir de um CEP.
// Em um cenário real, você usaria uma API de CEP (ex: ViaCEP) para obter o estado,
// e então mapearia o estado para uma região.
export const getRegionFromCep = async (cep: string): Promise<string | null> => {
  // Simulação: para fins de demonstração, vamos retornar uma região fixa ou aleatória
  // ou uma região baseada em um prefixo de CEP simples.
  // Em produção, você faria uma chamada fetch() para uma API.
  await new Promise(resolve => setTimeout(resolve, 500)); // Simula um atraso de rede

  const cleanedCep = cep.replace(/\D/g, ''); // Remove caracteres não numéricos

  if (cleanedCep.startsWith('0') || cleanedCep.startsWith('1') || cleanedCep.startsWith('2') || cleanedCep.startsWith('3')) {
    return "Sudeste";
  }
  if (cleanedCep.startsWith('8') || cleanedCep.startsWith('9')) {
    return "Sul";
  }
  if (cleanedCep.startsWith('4') || cleanedCep.startsWith('5')) {
    return "Nordeste";
  }
  if (cleanedCep.startsWith('6')) {
    return "Norte";
  }
  if (cleanedCep.startsWith('7')) {
    return "Centro-Oeste";
  }

  return null; // Região não encontrada
};