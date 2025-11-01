# Indicador TakePips para MT5

Indicador para MetaTrader 5 que permite criar e enviar sinais de trading através de um endpoint externo.

## Características

- **Linhas arrastáveis** para definir pontos de entrada, stop loss e takes
- **Linha de entrada BUY** (verde, linha sólida)
- **Linha de entrada SELL** (vermelha, linha sólida)
- **Linha de Stop Loss** (vermelha, linha tracejada)
- **Linha Take 1** (azul, linha pontilhada)
- **Linha Take 2** (ciano, linha pontilhada)
- **Linha Take 3** (amarelo, linha pontilhada)
- **Botão de envio** para integrar com o backend

## Instalação

1. Copie o arquivo `TakePips.mq5` para a pasta `MQL5/Indicators/` do seu MetaTrader 5
2. Compile o indicador através do MetaEditor (F7)
3. Arraste o indicador para o gráfico desejado

## Configuração

Antes de usar, você precisa:

1. **Configurar a URL do endpoint**:
   - Nas propriedades do indicador (botão direito -> Propriedades)
   - Altere o campo `EndpointURL` para a URL do seu backend

2. **Permitir WebRequest no MT5**:
   - Vá em `Tools -> Options -> Expert Advisors`
   - Marque "Allow WebRequest for listed URL"
   - Adicione a URL do seu endpoint (ex: `http://localhost:3000/*` ou `https://seudominio.com/*`)

## Como Usar

1. **Arraste as linhas** para os pontos desejados no gráfico:
   - Arraste a linha verde ou vermelha para o ponto de entrada desejado
   - Arraste a linha de Stop Loss para o nível de stop
   - Arraste as linhas Take 1, 2 e 3 para os níveis de take profit

2. **Clique no botão "Enviar Sinal"** localizado no canto superior esquerdo do gráfico

3. O indicador irá:
   - Determinar automaticamente se é sinal de BUY ou SELL (baseado na linha de entrada mais próxima do preço atual)
   - Calcular o número de ticks entre entry e stop loss
   - Enviar todos os dados para o endpoint configurado no formato JSON especificado

## Formato do JSON Enviado

```json
{
  "name": "TakePips",
  "type": "BUY",
  "symbol": "XAUUSD",
  "entry": 2385.15,
  "stopLoss": 2380.00,
  "take1": 2395.00,
  "take2": 2395.00,
  "take3": 2395.00,
  "stopTicks": 515,
  "time": "2025.10.31 22:40:02"
}
```

## Parâmetros do Indicador

- **EndpointURL**: URL do endpoint para onde os sinais serão enviados
- **FontSize**: Tamanho da fonte do botão (padrão: 10)
- **ButtonColor**: Cor de fundo do botão (padrão: Azul)
- **ButtonTextColor**: Cor do texto do botão (padrão: Branco)

## Notas Importantes

- O indicador determina automaticamente BUY ou SELL baseado na linha de entrada mais próxima do preço atual
- Os valores são enviados com a precisão correta baseada no símbolo (digits)
- O cálculo de `stopTicks` é feito automaticamente baseado na diferença entre entry e stopLoss
- Certifique-se de que o endpoint está configurado para receber requisições POST com Content-Type: application/json

## Solução de Problemas

**Erro 4060 ao enviar**:
- Adicione a URL nas URLs permitidas em Tools -> Options -> Expert Advisors

**Botão não aparece**:
- Recompile o indicador (F7 no MetaEditor)
- Remova e adicione o indicador novamente no gráfico

**Linhas não são arrastáveis**:
- Certifique-se de que o modo de seleção de objetos está ativo (botão "Crosshair" na barra de ferramentas)
- Clique na linha para selecioná-la antes de arrastar

