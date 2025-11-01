//+------------------------------------------------------------------+
//|                                                  TakePips.mq5    |
//|                        Indicador para envio de sinais           |
//+------------------------------------------------------------------+
#property copyright "TakePips"
#property link      ""
#property version   "1.00"
#property strict
#property indicator_chart_window
#property indicator_buffers 0
#property indicator_plots   0

#include <Trade/Trade.mqh>

//--- Inputs
input string EndpointURL = "http://localhost:3000/api/signals"; // URL do endpoint
input int    FontSize = 10; // Tamanho da fonte dos botões
input color  ButtonColor = clrDodgerBlue; // Cor do botão
input color  ButtonTextColor = clrWhite; // Cor do texto do botão

//--- Variáveis globais
string LinePrefix = "TakePips_";
string BuyEntryLine = LinePrefix + "BuyEntry";
string SellEntryLine = LinePrefix + "SellEntry";
string BuyStopLossLine = LinePrefix + "BuyStopLoss";
string BuyTake1Line = LinePrefix + "BuyTake1";
string BuyTake2Line = LinePrefix + "BuyTake2";
string BuyTake3Line = LinePrefix + "BuyTake3";
string SellStopLossLine = LinePrefix + "SellStopLoss";
string SellTake1Line = LinePrefix + "SellTake1";
string SellTake2Line = LinePrefix + "SellTake2";
string SellTake3Line = LinePrefix + "SellTake3";
string ButtonName = LinePrefix + "SendButton";

//--- Variáveis de controle
bool LinesInitialized = false;
ENUM_TIMEFRAMES CurrentTimeframe;
string CurrentSymbol;

//+------------------------------------------------------------------+
//| Função de inicialização do indicador                            |
//+------------------------------------------------------------------+
int OnInit()
{
   CurrentTimeframe = Period();
   CurrentSymbol = _Symbol;
   
   // Criar linhas iniciais se não existirem
   CreateLinesIfNeeded();
   
   // Criar botão de envio
   CreateSendButton();
   
   // Criar labels imediatamente após criar as linhas
   UpdateAllLabels();
   ChartRedraw();
   
   // Criar timer para atualizar labels periodicamente (a cada segundo)
   EventSetTimer(1);
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Função de desinicialização                                      |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   // Remover timer
   EventKillTimer();
   
   // Remover objetos quando o indicador é removido
   ObjectsDeleteAll(0, LinePrefix);
   ChartRedraw();
}

//+------------------------------------------------------------------+
//| Manipulador de timer                                             |
//+------------------------------------------------------------------+
void OnTimer()
{
   // Atualizar labels periodicamente
   if(LinesInitialized)
   {
      UpdateAllLabels();
      ChartRedraw();
   }
}

//+------------------------------------------------------------------+
//| Função principal de cálculo (não usada mas obrigatória)         |
//+------------------------------------------------------------------+
int OnCalculate(const int rates_total,
                const int prev_calculated,
                const datetime &time[],
                const double &open[],
                const double &high[],
                const double &low[],
                const double &close[],
                const long &tick_volume[],
                const long &volume[],
                const int &spread[])
{
   // Atualizar labels periodicamente
   static datetime lastUpdate = 0;
   datetime currentTime = TimeCurrent();
   
   // Atualizar a cada segundo ou na primeira chamada
   if(currentTime != lastUpdate)
   {
      if(LinesInitialized)
         UpdateAllLabels();
      lastUpdate = currentTime;
   }
   
   return(rates_total);
}

//+------------------------------------------------------------------+
//| Criar label de texto acima da linha                              |
//+------------------------------------------------------------------+
void CreateLineLabel(string lineName, string labelText, color labelColor)
{
   string labelName = lineName + "_Label";
   
   // Verificar se a linha existe
   if(ObjectFind(0, lineName) < 0)
   {
      // Se a linha não existe, remover o label se existir
      if(ObjectFind(0, labelName) >= 0)
         ObjectDelete(0, labelName);
      return;
   }
   
   // Obter preço da linha
   double linePrice = ObjectGetDouble(0, lineName, OBJPROP_PRICE);
   if(linePrice <= 0)
      return;
   
   // Obter tempo - usar barra recente mas visível
   datetime labelTime = 0;
   int bars = iBars(_Symbol, PERIOD_CURRENT);
   
   if(bars > 10)
   {
      // Pegar barra um pouco à esquerda (índice 10-20)
      int barIndex = MathMin(20, bars - 1);
      labelTime = iTime(_Symbol, PERIOD_CURRENT, barIndex);
   }
   
   // Se ainda não tem tempo, tentar obter de outra forma
   if(labelTime == 0)
   {
      datetime times[];
      ArraySetAsSeries(times, false);
      if(CopyTime(_Symbol, PERIOD_CURRENT, 0, 1, times) > 0)
         labelTime = times[0];
      
      if(labelTime == 0)
         labelTime = TimeCurrent();
   }
   
   // Calcular offset de preço acima da linha
   double priceRange = ChartGetDouble(0, CHART_PRICE_MAX) - ChartGetDouble(0, CHART_PRICE_MIN);
   
   // Se não conseguir range, usar um valor fixo baseado no preço
   double offsetPoints;
   if(priceRange > 0)
   {
      offsetPoints = priceRange * 0.015; // 1.5% do range acima
   }
   else
   {
      // Fallback: usar um offset fixo baseado no tipo de símbolo
      int digits = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);
      if(digits == 5 || digits == 3)
         offsetPoints = _Point * 50; // 5 pips para 5/3 dígitos
      else if(digits == 2 || digits == 4)
         offsetPoints = _Point * 5; // 0.5 pips para 2/4 dígitos
      else
         offsetPoints = linePrice * 0.001; // 0.1% do preço como fallback
   }
   
   double labelPrice = NormalizeDouble(linePrice + offsetPoints, (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS));
   
   // Verificar se label já existe
   bool labelExists = (ObjectFind(0, labelName) >= 0);
   
   if(!labelExists)
   {
      // Criar novo label
      bool created = ObjectCreate(0, labelName, OBJ_TEXT, 0, labelTime, labelPrice);
      
      if(created)
      {
         ObjectSetString(0, labelName, OBJPROP_TEXT, labelText);
         ObjectSetInteger(0, labelName, OBJPROP_COLOR, labelColor);
         ObjectSetInteger(0, labelName, OBJPROP_FONTSIZE, 10);
         ObjectSetString(0, labelName, OBJPROP_FONT, "Arial Bold");
         ObjectSetInteger(0, labelName, OBJPROP_ANCHOR, ANCHOR_LEFT);
         ObjectSetInteger(0, labelName, OBJPROP_BACK, false);
         ObjectSetInteger(0, labelName, OBJPROP_SELECTABLE, false);
         ObjectSetInteger(0, labelName, OBJPROP_SELECTED, false);
      }
   }
   else
   {
      // Atualizar label existente
      ObjectSetInteger(0, labelName, OBJPROP_TIME, labelTime);
      ObjectSetDouble(0, labelName, OBJPROP_PRICE, labelPrice);
      ObjectSetString(0, labelName, OBJPROP_TEXT, labelText);
      ObjectSetInteger(0, labelName, OBJPROP_COLOR, labelColor);
   }
}

//+------------------------------------------------------------------+
//| Atualizar todos os labels quando linhas são movidas              |
//+------------------------------------------------------------------+
void UpdateAllLabels()
{
   // Labels para BUY
   CreateLineLabel(BuyEntryLine, "BUY Entry", clrLime);
   CreateLineLabel(BuyStopLossLine, "BUY Stop", clrRed);
   CreateLineLabel(BuyTake1Line, "BUY Take 1", clrBlue);
   CreateLineLabel(BuyTake2Line, "BUY Take 2", clrCyan);
   CreateLineLabel(BuyTake3Line, "BUY Take 3", clrYellow);
   
   // Labels para SELL
   CreateLineLabel(SellEntryLine, "SELL Entry", clrRed);
   CreateLineLabel(SellStopLossLine, "SELL Stop", clrRed);
   CreateLineLabel(SellTake1Line, "SELL Take 1", clrBlue);
   CreateLineLabel(SellTake2Line, "SELL Take 2", clrCyan);
   CreateLineLabel(SellTake3Line, "SELL Take 3", clrYellow);
}

//+------------------------------------------------------------------+
//| Manipulador de eventos do gráfico                               |
//+------------------------------------------------------------------+
void OnChartEvent(const int id,
                  const long &lparam,
                  const double &dparam,
                  const string &sparam)
{
   if(id == CHARTEVENT_OBJECT_CLICK)
   {
      if(sparam == ButtonName)
      {
         OnSendButtonClick();
      }
   }
   
   if(id == CHARTEVENT_OBJECT_DRAG)
   {
      // Atualizar labels quando linhas são arrastadas
      UpdateAllLabels();
      ChartRedraw();
   }
   
   // Atualizar labels quando há zoom ou mudança de escala
   if(id == CHARTEVENT_CHART_CHANGE)
   {
      UpdateAllLabels();
   }
}

//+------------------------------------------------------------------+
//| Criar linhas se não existirem                                   |
//+------------------------------------------------------------------+
void CreateLinesIfNeeded()
{
   double price = iClose(_Symbol, PERIOD_CURRENT, 0);
   datetime time = TimeCurrent();
   double point = _Point;
   
   // ========== LINHAS PARA COMPRA (BUY) ==========
   
   // Linha de entrada para compra (verde)
   if(ObjectFind(0, BuyEntryLine) < 0)
   {
      ObjectCreate(0, BuyEntryLine, OBJ_HLINE, 0, 0, price);
      ObjectSetInteger(0, BuyEntryLine, OBJPROP_COLOR, clrLime);
      ObjectSetInteger(0, BuyEntryLine, OBJPROP_STYLE, STYLE_SOLID);
      ObjectSetInteger(0, BuyEntryLine, OBJPROP_WIDTH, 2);
      ObjectSetInteger(0, BuyEntryLine, OBJPROP_BACK, false);
      ObjectSetInteger(0, BuyEntryLine, OBJPROP_SELECTABLE, true);
      ObjectSetInteger(0, BuyEntryLine, OBJPROP_SELECTED, false);
      ObjectSetString(0, BuyEntryLine, OBJPROP_TEXT, "BUY Entry");
      ObjectSetInteger(0, BuyEntryLine, OBJPROP_FONTSIZE, 10);
   }
   
   // Stop Loss para compra (vermelha tracejada)
   if(ObjectFind(0, BuyStopLossLine) < 0)
   {
      ObjectCreate(0, BuyStopLossLine, OBJ_HLINE, 0, 0, price - 100 * point);
      ObjectSetInteger(0, BuyStopLossLine, OBJPROP_COLOR, clrRed);
      ObjectSetInteger(0, BuyStopLossLine, OBJPROP_STYLE, STYLE_DASH);
      ObjectSetInteger(0, BuyStopLossLine, OBJPROP_WIDTH, 2);
      ObjectSetInteger(0, BuyStopLossLine, OBJPROP_BACK, false);
      ObjectSetInteger(0, BuyStopLossLine, OBJPROP_SELECTABLE, true);
      ObjectSetInteger(0, BuyStopLossLine, OBJPROP_SELECTED, false);
      ObjectSetString(0, BuyStopLossLine, OBJPROP_TEXT, "BUY Stop Loss");
      ObjectSetInteger(0, BuyStopLossLine, OBJPROP_FONTSIZE, 10);
   }
   
   // Take 1 para compra (azul)
   if(ObjectFind(0, BuyTake1Line) < 0)
   {
      ObjectCreate(0, BuyTake1Line, OBJ_HLINE, 0, 0, price + 50 * point);
      ObjectSetInteger(0, BuyTake1Line, OBJPROP_COLOR, clrBlue);
      ObjectSetInteger(0, BuyTake1Line, OBJPROP_STYLE, STYLE_DOT);
      ObjectSetInteger(0, BuyTake1Line, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, BuyTake1Line, OBJPROP_BACK, false);
      ObjectSetInteger(0, BuyTake1Line, OBJPROP_SELECTABLE, true);
      ObjectSetInteger(0, BuyTake1Line, OBJPROP_SELECTED, false);
      ObjectSetString(0, BuyTake1Line, OBJPROP_TEXT, "BUY Take 1");
      ObjectSetInteger(0, BuyTake1Line, OBJPROP_FONTSIZE, 10);
   }
   
   // Take 2 para compra (ciano)
   if(ObjectFind(0, BuyTake2Line) < 0)
   {
      ObjectCreate(0, BuyTake2Line, OBJ_HLINE, 0, 0, price + 75 * point);
      ObjectSetInteger(0, BuyTake2Line, OBJPROP_COLOR, clrCyan);
      ObjectSetInteger(0, BuyTake2Line, OBJPROP_STYLE, STYLE_DOT);
      ObjectSetInteger(0, BuyTake2Line, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, BuyTake2Line, OBJPROP_BACK, false);
      ObjectSetInteger(0, BuyTake2Line, OBJPROP_SELECTABLE, true);
      ObjectSetInteger(0, BuyTake2Line, OBJPROP_SELECTED, false);
      ObjectSetString(0, BuyTake2Line, OBJPROP_TEXT, "BUY Take 2");
      ObjectSetInteger(0, BuyTake2Line, OBJPROP_FONTSIZE, 10);
   }
   
   // Take 3 para compra (amarelo)
   if(ObjectFind(0, BuyTake3Line) < 0)
   {
      ObjectCreate(0, BuyTake3Line, OBJ_HLINE, 0, 0, price + 100 * point);
      ObjectSetInteger(0, BuyTake3Line, OBJPROP_COLOR, clrYellow);
      ObjectSetInteger(0, BuyTake3Line, OBJPROP_STYLE, STYLE_DOT);
      ObjectSetInteger(0, BuyTake3Line, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, BuyTake3Line, OBJPROP_BACK, false);
      ObjectSetInteger(0, BuyTake3Line, OBJPROP_SELECTABLE, true);
      ObjectSetInteger(0, BuyTake3Line, OBJPROP_SELECTED, false);
      ObjectSetString(0, BuyTake3Line, OBJPROP_TEXT, "BUY Take 3");
      ObjectSetInteger(0, BuyTake3Line, OBJPROP_FONTSIZE, 10);
   }
   
   // ========== LINHAS PARA VENDA (SELL) ==========
   
   // Linha de entrada para venda (vermelha)
   if(ObjectFind(0, SellEntryLine) < 0)
   {
      ObjectCreate(0, SellEntryLine, OBJ_HLINE, 0, 0, price);
      ObjectSetInteger(0, SellEntryLine, OBJPROP_COLOR, clrRed);
      ObjectSetInteger(0, SellEntryLine, OBJPROP_STYLE, STYLE_SOLID);
      ObjectSetInteger(0, SellEntryLine, OBJPROP_WIDTH, 2);
      ObjectSetInteger(0, SellEntryLine, OBJPROP_BACK, false);
      ObjectSetInteger(0, SellEntryLine, OBJPROP_SELECTABLE, true);
      ObjectSetInteger(0, SellEntryLine, OBJPROP_SELECTED, false);
      ObjectSetString(0, SellEntryLine, OBJPROP_TEXT, "SELL Entry");
      ObjectSetInteger(0, SellEntryLine, OBJPROP_FONTSIZE, 10);
   }
   
   // Stop Loss para venda (vermelha tracejada)
   if(ObjectFind(0, SellStopLossLine) < 0)
   {
      ObjectCreate(0, SellStopLossLine, OBJ_HLINE, 0, 0, price + 100 * point);
      ObjectSetInteger(0, SellStopLossLine, OBJPROP_COLOR, clrRed);
      ObjectSetInteger(0, SellStopLossLine, OBJPROP_STYLE, STYLE_DASH);
      ObjectSetInteger(0, SellStopLossLine, OBJPROP_WIDTH, 2);
      ObjectSetInteger(0, SellStopLossLine, OBJPROP_BACK, false);
      ObjectSetInteger(0, SellStopLossLine, OBJPROP_SELECTABLE, true);
      ObjectSetInteger(0, SellStopLossLine, OBJPROP_SELECTED, false);
      ObjectSetString(0, SellStopLossLine, OBJPROP_TEXT, "SELL Stop Loss");
      ObjectSetInteger(0, SellStopLossLine, OBJPROP_FONTSIZE, 10);
   }
   
   // Take 1 para venda (azul)
   if(ObjectFind(0, SellTake1Line) < 0)
   {
      ObjectCreate(0, SellTake1Line, OBJ_HLINE, 0, 0, price - 50 * point);
      ObjectSetInteger(0, SellTake1Line, OBJPROP_COLOR, clrBlue);
      ObjectSetInteger(0, SellTake1Line, OBJPROP_STYLE, STYLE_DOT);
      ObjectSetInteger(0, SellTake1Line, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, SellTake1Line, OBJPROP_BACK, false);
      ObjectSetInteger(0, SellTake1Line, OBJPROP_SELECTABLE, true);
      ObjectSetInteger(0, SellTake1Line, OBJPROP_SELECTED, false);
      ObjectSetString(0, SellTake1Line, OBJPROP_TEXT, "SELL Take 1");
      ObjectSetInteger(0, SellTake1Line, OBJPROP_FONTSIZE, 10);
   }
   
   // Take 2 para venda (ciano)
   if(ObjectFind(0, SellTake2Line) < 0)
   {
      ObjectCreate(0, SellTake2Line, OBJ_HLINE, 0, 0, price - 75 * point);
      ObjectSetInteger(0, SellTake2Line, OBJPROP_COLOR, clrCyan);
      ObjectSetInteger(0, SellTake2Line, OBJPROP_STYLE, STYLE_DOT);
      ObjectSetInteger(0, SellTake2Line, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, SellTake2Line, OBJPROP_BACK, false);
      ObjectSetInteger(0, SellTake2Line, OBJPROP_SELECTABLE, true);
      ObjectSetInteger(0, SellTake2Line, OBJPROP_SELECTED, false);
      ObjectSetString(0, SellTake2Line, OBJPROP_TEXT, "SELL Take 2");
      ObjectSetInteger(0, SellTake2Line, OBJPROP_FONTSIZE, 10);
   }
   
   // Take 3 para venda (amarelo)
   if(ObjectFind(0, SellTake3Line) < 0)
   {
      ObjectCreate(0, SellTake3Line, OBJ_HLINE, 0, 0, price - 100 * point);
      ObjectSetInteger(0, SellTake3Line, OBJPROP_COLOR, clrYellow);
      ObjectSetInteger(0, SellTake3Line, OBJPROP_STYLE, STYLE_DOT);
      ObjectSetInteger(0, SellTake3Line, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, SellTake3Line, OBJPROP_BACK, false);
      ObjectSetInteger(0, SellTake3Line, OBJPROP_SELECTABLE, true);
      ObjectSetInteger(0, SellTake3Line, OBJPROP_SELECTED, false);
      ObjectSetString(0, SellTake3Line, OBJPROP_TEXT, "SELL Take 3");
      ObjectSetInteger(0, SellTake3Line, OBJPROP_FONTSIZE, 10);
   }
   
   LinesInitialized = true;
   
   // Criar labels de texto acima das linhas
   UpdateAllLabels();
   ChartRedraw();
}

//+------------------------------------------------------------------+
//| Criar botão de envio                                            |
//+------------------------------------------------------------------+
void CreateSendButton()
{
   int x = 10;
   int y = 30;
   int width = 150;
   int height = 30;
   
   if(ObjectFind(0, ButtonName) < 0)
   {
      ObjectCreate(0, ButtonName, OBJ_BUTTON, 0, 0, 0);
      ObjectSetInteger(0, ButtonName, OBJPROP_XDISTANCE, x);
      ObjectSetInteger(0, ButtonName, OBJPROP_YDISTANCE, y);
      ObjectSetInteger(0, ButtonName, OBJPROP_XSIZE, width);
      ObjectSetInteger(0, ButtonName, OBJPROP_YSIZE, height);
      ObjectSetInteger(0, ButtonName, OBJPROP_BGCOLOR, ButtonColor);
      ObjectSetInteger(0, ButtonName, OBJPROP_COLOR, ButtonTextColor);
      ObjectSetInteger(0, ButtonName, OBJPROP_BORDER_COLOR, clrWhite);
      ObjectSetInteger(0, ButtonName, OBJPROP_CORNER, CORNER_LEFT_LOWER);
      ObjectSetString(0, ButtonName, OBJPROP_TEXT, "Enviar Sinal");
      ObjectSetInteger(0, ButtonName, OBJPROP_FONTSIZE, FontSize);
      ObjectSetInteger(0, ButtonName, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(0, ButtonName, OBJPROP_SELECTED, false);
   }
}

//+------------------------------------------------------------------+
//| Manipulador de clique no botão de envio                         |
//+------------------------------------------------------------------+
void OnSendButtonClick()
{
   // Obter preços das linhas de entrada
   double buyEntry = ObjectGetDouble(0, BuyEntryLine, OBJPROP_PRICE);
   double sellEntry = ObjectGetDouble(0, SellEntryLine, OBJPROP_PRICE);
   
   // Determinar tipo baseado na posição relativa das linhas
   // Se BUY está acima de SELL, usa BUY, caso contrário usa SELL
   // Ou usa a mais próxima do preço atual como fallback
   string signalType;
   double entryPrice;
   double currentPrice = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   
   if(buyEntry > sellEntry)
   {
      // BUY está acima, usar BUY
      signalType = "BUY";
      entryPrice = buyEntry;
   }
   else if(sellEntry > buyEntry)
   {
      // SELL está acima, usar SELL
      signalType = "SELL";
      entryPrice = sellEntry;
   }
   else
   {
      // Linhas estão na mesma posição, usar a mais próxima do preço atual
      double buyDistance = MathAbs(currentPrice - buyEntry);
      double sellDistance = MathAbs(currentPrice - sellEntry);
      
      if(buyDistance < sellDistance)
      {
         signalType = "BUY";
         entryPrice = buyEntry;
      }
      else
      {
         signalType = "SELL";
         entryPrice = sellEntry;
      }
   }
   
   // Obter valores das linhas baseado no tipo de sinal
   double stopLoss, take1, take2, take3;
   
   if(signalType == "BUY")
   {
      stopLoss = ObjectGetDouble(0, BuyStopLossLine, OBJPROP_PRICE);
      take1 = ObjectGetDouble(0, BuyTake1Line, OBJPROP_PRICE);
      take2 = ObjectGetDouble(0, BuyTake2Line, OBJPROP_PRICE);
      take3 = ObjectGetDouble(0, BuyTake3Line, OBJPROP_PRICE);
   }
   else // SELL
   {
      stopLoss = ObjectGetDouble(0, SellStopLossLine, OBJPROP_PRICE);
      take1 = ObjectGetDouble(0, SellTake1Line, OBJPROP_PRICE);
      take2 = ObjectGetDouble(0, SellTake2Line, OBJPROP_PRICE);
      take3 = ObjectGetDouble(0, SellTake3Line, OBJPROP_PRICE);
   }
   
   // Calcular stopTicks (diferença em ticks entre entry e stopLoss)
   double tickSize = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   int digits = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);
   
   // Se tickSize não estiver disponível, calcular baseado em point
   if(tickSize <= 0)
   {
      double pointValue = SymbolInfoDouble(_Symbol, SYMBOL_POINT);
      if(digits == 3 || digits == 5)
         tickSize = pointValue * 10;
      else
         tickSize = pointValue;
   }
   
   double priceDiff = MathAbs(entryPrice - stopLoss);
   int stopTicks = (int)MathRound(priceDiff / tickSize);
   
   if(stopTicks <= 0)
      stopTicks = 1; // Mínimo de 1 tick
   
   // Obter data/hora atual no formato "YYYY.MM.DD HH:MM:SS"
   datetime currentTime = TimeCurrent();
   MqlDateTime dt;
   TimeToStruct(currentTime, dt);
   string timeStr = StringFormat("%04d.%02d.%02d %02d:%02d:%02d", 
                                 dt.year, dt.mon, dt.day, 
                                 dt.hour, dt.min, dt.sec);
   
   // Preparar JSON
   string json = "{"
                 + "\"name\":\"TakePips\","
                 + "\"type\":\"" + signalType + "\","
                 + "\"symbol\":\"" + _Symbol + "\","
                 + "\"entry\":" + DoubleToString(entryPrice, digits) + ","
                 + "\"stopLoss\":" + DoubleToString(stopLoss, digits) + ","
                 + "\"take1\":" + DoubleToString(take1, digits) + ","
                 + "\"take2\":" + DoubleToString(take2, digits) + ","
                 + "\"take3\":" + DoubleToString(take3, digits) + ","
                 + "\"stopTicks\":" + IntegerToString(stopTicks) + ","
                 + "\"time\":\"" + timeStr + "\""
                 + "}";
   
   // Enviar para o endpoint
   bool success = SendSignalToEndpoint(json);
   
   if(success)
   {
      Alert("Sinal enviado com sucesso!");
   }
   else
   {
      Alert("Erro ao enviar sinal. Verifique a URL do endpoint e a conexão.");
   }
}

//+------------------------------------------------------------------+
//| Enviar sinal para o endpoint                                    |
//+------------------------------------------------------------------+
bool SendSignalToEndpoint(string jsonData)
{
   string url = EndpointURL;
   
   // Preparar cabeçalhos HTTP
   string headers = "Content-Type: application/json\r\n";
   
   // Preparar dados
   char post[];
   char result[];
   string result_headers;
   
   StringToCharArray(jsonData, post, 0, WHOLE_ARRAY, CP_UTF8);
   
   // Realizar requisição HTTP POST
   int timeout = 5000; // 5 segundos
   int res = WebRequest("POST", url, headers, timeout, post, result, result_headers);
   
   if(res == -1)
   {
      int error = GetLastError();
      Print("Erro WebRequest: ", error);
      Print("URL tentada: ", url);
      
      if(error == 4060)
      {
         Alert("Erro 4060: URL não permitida.\n\nAdicione '" + url + "' nas URLs permitidas:\nTools -> Options -> Expert Advisors -> Allow WebRequest for listed URL");
      }
      else if(error == 4014)
      {
         string errorMsg = "Erro 4014: Falha na conexão HTTP.\n\n";
         errorMsg += "Verifique:\n";
         errorMsg += "1. Servidor está rodando? (npm run dev)\n";
         errorMsg += "2. URL está correta? " + url + "\n";
         errorMsg += "3. Firewall/Antivírus não está bloqueando?\n";
         errorMsg += "4. Tente usar o IP da máquina em vez de localhost\n";
         errorMsg += "   Ex: http://192.168.1.100:3000/api/signals";
         Alert(errorMsg);
      }
      else
      {
         Alert("Erro WebRequest " + IntegerToString(error) + ": Falha ao enviar requisição.\n\nURL: " + url);
      }
      return false;
   }
   
   // Verificar código de resposta
   if(res >= 200 && res < 300)
   {
      Print("Sinal enviado com sucesso. Resposta: ", CharArrayToString(result));
      return true;
   }
   else
   {
      Print("Erro na resposta do servidor. Código: ", res);
      Print("Resposta: ", CharArrayToString(result));
      return false;
   }
}

//+------------------------------------------------------------------+
