//+------------------------------------------------------------------+
//|                                                  TakePips_EA.mq5  |
//|                        EA para envio automático de sinais         |
//|                        Envia sinal quando preço atinge as linhas   |
//+------------------------------------------------------------------+
#property copyright "TakePips"
#property link      ""
#property version   "1.00"
#property strict

#include <Trade/Trade.mqh>

//--- Inputs
input string EndpointURL = "https://takepips.vercel.app/api/signals"; // URL do endpoint
input bool   AutoSendSignals = true; // Enviar sinais automaticamente quando preço atingir linhas
input bool   TestConnectionOnStart = true; // Testar conexão ao iniciar
input double PriceTolerance = 0.0001; // Tolerância para considerar que preço atingiu a linha

//--- Variáveis globais para linhas
string LinePrefix = "TakePips_EA_";
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
bool BuySignalSent = false; // Controla se já enviou sinal BUY
bool SellSignalSent = false; // Controla se já enviou sinal SELL
datetime lastSignalTime = 0;

//--- Variáveis para rastreamento de IDs e status
string BuySignalId = ""; // ID do sinal BUY retornado pela API
string SellSignalId = ""; // ID do sinal SELL retornado pela API
bool BuyEntryHit = false; // Se entrada BUY foi atingida (necessário para monitorar stop)
bool SellEntryHit = false; // Se entrada SELL foi atingida (necessário para monitorar stop)
bool BuyStopHit = false; // Se stop loss BUY foi atingido
bool BuyTake1Hit = false; // Se take 1 BUY foi atingido
bool BuyTake2Hit = false; // Se take 2 BUY foi atingido
bool BuyTake3Hit = false; // Se take 3 BUY foi atingido
bool SellStopHit = false; // Se stop loss SELL foi atingido
bool SellTake1Hit = false; // Se take 1 SELL foi atingido
bool SellTake2Hit = false; // Se take 2 SELL foi atingido
bool SellTake3Hit = false; // Se take 3 SELL foi atingido

//+------------------------------------------------------------------+
//| Função de inicialização do EA                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("=== TakePips EA Iniciado ===");
   Print("Endpoint URL: ", EndpointURL);
   Print("Auto Send Signals: ", AutoSendSignals);
   
   // Criar linhas se não existirem
   CreateLinesIfNeeded();
   
   // Criar botão de envio
   CreateSendButton();
   
   if(TestConnectionOnStart)
   {
      Print("Testando conexão...");
      TestConnection();
   }
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Função de desinicialização                                      |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   Print("TakePips EA finalizado. Razão: ", reason);
   Print("🧹 Limpando objetos do gráfico...");
   
   // Deletar todas as linhas BUY
   ObjectDelete(0, BuyEntryLine);
   ObjectDelete(0, BuyStopLossLine);
   ObjectDelete(0, BuyTake1Line);
   ObjectDelete(0, BuyTake2Line);
   ObjectDelete(0, BuyTake3Line);
   
   // Deletar todas as linhas SELL
   ObjectDelete(0, SellEntryLine);
   ObjectDelete(0, SellStopLossLine);
   ObjectDelete(0, SellTake1Line);
   ObjectDelete(0, SellTake2Line);
   ObjectDelete(0, SellTake3Line);
   
   // Deletar todos os labels (BUY)
   ObjectDelete(0, BuyEntryLine + "_Label");
   ObjectDelete(0, BuyStopLossLine + "_Label");
   ObjectDelete(0, BuyTake1Line + "_Label");
   ObjectDelete(0, BuyTake2Line + "_Label");
   ObjectDelete(0, BuyTake3Line + "_Label");
   
   // Deletar todos os labels (SELL)
   ObjectDelete(0, SellEntryLine + "_Label");
   ObjectDelete(0, SellStopLossLine + "_Label");
   ObjectDelete(0, SellTake1Line + "_Label");
   ObjectDelete(0, SellTake2Line + "_Label");
   ObjectDelete(0, SellTake3Line + "_Label");
   
   // Deletar botão
   ObjectDelete(0, ButtonName);
   
   // Redesenhar gráfico para remover os objetos
   ChartRedraw();
   
   Print("✅ Limpeza concluída. Todos os objetos foram removidos.");
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
      if(LinesInitialized)
      {
         UpdateAllLabels();
         ChartRedraw();
      }
   }
   
   // Atualizar labels quando há zoom ou mudança de escala
   if(id == CHARTEVENT_CHART_CHANGE)
   {
      if(LinesInitialized)
      {
         UpdateAllLabels();
      }
   }
}

//+------------------------------------------------------------------+
//| Função principal (executada a cada tick)                        |
//+------------------------------------------------------------------+
void OnTick()
{
   // Atualizar labels periodicamente (a cada segundo)
   static datetime lastLabelUpdate = 0;
   datetime currentTime = TimeCurrent();
   
   if(LinesInitialized && currentTime != lastLabelUpdate)
   {
      UpdateAllLabels();
      lastLabelUpdate = currentTime;
   }
   
   // Monitorar preços se os sinais já foram enviados
   if(BuySignalId != "" || SellSignalId != "")
   {
      MonitorPriceLevels();
   }
   
   if(!AutoSendSignals || !LinesInitialized)
      return;
   
   // Obter preços atuais
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   
   // Verificar se preço atingiu linha de entrada BUY
   if(!BuySignalSent)
   {
      double buyEntry = ObjectGetDouble(0, BuyEntryLine, OBJPROP_PRICE);
      if(buyEntry > 0)
      {
         // Se o preço ASK (para compra) atingir ou ultrapassar a linha de entrada BUY
         if(ask >= buyEntry - PriceTolerance && ask <= buyEntry + PriceTolerance)
         {
            SendBuySignal();
            BuySignalSent = true;
         }
      }
   }
   
   // Verificar se preço atingiu linha de entrada SELL
   if(!SellSignalSent)
   {
      double sellEntry = ObjectGetDouble(0, SellEntryLine, OBJPROP_PRICE);
      if(sellEntry > 0)
      {
         // Se o preço BID (para venda) atingir ou ultrapassar a linha de entrada SELL
         if(bid <= sellEntry + PriceTolerance && bid >= sellEntry - PriceTolerance)
         {
            SendSellSignal();
            SellSignalSent = true;
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Criar linhas se não existirem                                   |
//+------------------------------------------------------------------+
void CreateLinesIfNeeded()
{
   double price = iClose(_Symbol, PERIOD_CURRENT, 0);
   double point = _Point;
   
   // Calcular espaçamento inicial baseado no preço atual
   // Para pares com muitos dígitos (BTC, índices), usar percentual
   // Para pares normais (FX), usar pontos fixos
   int digits = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);
   double spacing;
   
   // Se o preço é grande (muitos dígitos), usar percentual
   if(digits <= 3)
   {
      spacing = price * 0.001; // 0.1% do preço (para FX)
   }
   else if(digits == 5)
   {
      spacing = price * 0.0005; // 0.05% do preço (para BTCUSD, etc)
   }
   else
   {
      spacing = price * 0.0001; // 0.01% do preço (para preços muito altos)
   }
   
   // Mínimo de espaçamento: usar pelo menos alguns pontos
   double minSpacing = MathMax(spacing, 10 * point);
   if(digits >= 5)
      minSpacing = MathMax(spacing, 100 * point); // Para preços altos, mais espaçamento
   
   // ========== LINHAS PARA COMPRA (BUY) ==========
   // Ordem de cima para baixo: Take3, Take2, Take1, Entry, Stop
   
   // Take 3 para compra (amarelo) - mais alto
   if(ObjectFind(0, BuyTake3Line) < 0)
   {
      ObjectCreate(0, BuyTake3Line, OBJ_HLINE, 0, 0, price + 4 * minSpacing);
      ObjectSetInteger(0, BuyTake3Line, OBJPROP_COLOR, clrYellow);
      ObjectSetInteger(0, BuyTake3Line, OBJPROP_STYLE, STYLE_DOT);
      ObjectSetInteger(0, BuyTake3Line, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, BuyTake3Line, OBJPROP_BACK, false);
      ObjectSetInteger(0, BuyTake3Line, OBJPROP_SELECTABLE, true);
      ObjectSetString(0, BuyTake3Line, OBJPROP_TEXT, "BUY Take 3");
   }
   
   // Take 2 para compra (ciano)
   if(ObjectFind(0, BuyTake2Line) < 0)
   {
      ObjectCreate(0, BuyTake2Line, OBJ_HLINE, 0, 0, price + 3 * minSpacing);
      ObjectSetInteger(0, BuyTake2Line, OBJPROP_COLOR, clrCyan);
      ObjectSetInteger(0, BuyTake2Line, OBJPROP_STYLE, STYLE_DOT);
      ObjectSetInteger(0, BuyTake2Line, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, BuyTake2Line, OBJPROP_BACK, false);
      ObjectSetInteger(0, BuyTake2Line, OBJPROP_SELECTABLE, true);
      ObjectSetString(0, BuyTake2Line, OBJPROP_TEXT, "BUY Take 2");
   }
   
   // Take 1 para compra (azul)
   if(ObjectFind(0, BuyTake1Line) < 0)
   {
      ObjectCreate(0, BuyTake1Line, OBJ_HLINE, 0, 0, price + 2 * minSpacing);
      ObjectSetInteger(0, BuyTake1Line, OBJPROP_COLOR, clrBlue);
      ObjectSetInteger(0, BuyTake1Line, OBJPROP_STYLE, STYLE_DOT);
      ObjectSetInteger(0, BuyTake1Line, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, BuyTake1Line, OBJPROP_BACK, false);
      ObjectSetInteger(0, BuyTake1Line, OBJPROP_SELECTABLE, true);
      ObjectSetString(0, BuyTake1Line, OBJPROP_TEXT, "BUY Take 1");
   }
   
   // Linha de entrada para compra (verde)
   if(ObjectFind(0, BuyEntryLine) < 0)
   {
      ObjectCreate(0, BuyEntryLine, OBJ_HLINE, 0, 0, price);
      ObjectSetInteger(0, BuyEntryLine, OBJPROP_COLOR, clrLime);
      ObjectSetInteger(0, BuyEntryLine, OBJPROP_STYLE, STYLE_SOLID);
      ObjectSetInteger(0, BuyEntryLine, OBJPROP_WIDTH, 2);
      ObjectSetInteger(0, BuyEntryLine, OBJPROP_BACK, false);
      ObjectSetInteger(0, BuyEntryLine, OBJPROP_SELECTABLE, true);
      ObjectSetString(0, BuyEntryLine, OBJPROP_TEXT, "BUY Entry");
   }
   
   // Stop Loss para compra (vermelha tracejada) - mais baixo
   if(ObjectFind(0, BuyStopLossLine) < 0)
   {
      ObjectCreate(0, BuyStopLossLine, OBJ_HLINE, 0, 0, price - minSpacing);
      ObjectSetInteger(0, BuyStopLossLine, OBJPROP_COLOR, clrRed);
      ObjectSetInteger(0, BuyStopLossLine, OBJPROP_STYLE, STYLE_DASH);
      ObjectSetInteger(0, BuyStopLossLine, OBJPROP_WIDTH, 2);
      ObjectSetInteger(0, BuyStopLossLine, OBJPROP_BACK, false);
      ObjectSetInteger(0, BuyStopLossLine, OBJPROP_SELECTABLE, true);
      ObjectSetString(0, BuyStopLossLine, OBJPROP_TEXT, "BUY Stop Loss");
   }
   
   // ========== LINHAS PARA VENDA (SELL) ==========
   // Ordem de cima para baixo: Stop, Entry, Take1, Take2, Take3
   
   // Stop Loss para venda (vermelha tracejada) - mais alto
   if(ObjectFind(0, SellStopLossLine) < 0)
   {
      ObjectCreate(0, SellStopLossLine, OBJ_HLINE, 0, 0, price + minSpacing);
      ObjectSetInteger(0, SellStopLossLine, OBJPROP_COLOR, clrRed);
      ObjectSetInteger(0, SellStopLossLine, OBJPROP_STYLE, STYLE_DASH);
      ObjectSetInteger(0, SellStopLossLine, OBJPROP_WIDTH, 2);
      ObjectSetInteger(0, SellStopLossLine, OBJPROP_BACK, false);
      ObjectSetInteger(0, SellStopLossLine, OBJPROP_SELECTABLE, true);
      ObjectSetString(0, SellStopLossLine, OBJPROP_TEXT, "SELL Stop Loss");
   }
   
   // Linha de entrada para venda (vermelha)
   if(ObjectFind(0, SellEntryLine) < 0)
   {
      ObjectCreate(0, SellEntryLine, OBJ_HLINE, 0, 0, price);
      ObjectSetInteger(0, SellEntryLine, OBJPROP_COLOR, clrRed);
      ObjectSetInteger(0, SellEntryLine, OBJPROP_STYLE, STYLE_SOLID);
      ObjectSetInteger(0, SellEntryLine, OBJPROP_WIDTH, 2);
      ObjectSetInteger(0, SellEntryLine, OBJPROP_BACK, false);
      ObjectSetInteger(0, SellEntryLine, OBJPROP_SELECTABLE, true);
      ObjectSetString(0, SellEntryLine, OBJPROP_TEXT, "SELL Entry");
   }
   
   // Take 1 para venda (azul)
   if(ObjectFind(0, SellTake1Line) < 0)
   {
      ObjectCreate(0, SellTake1Line, OBJ_HLINE, 0, 0, price - 2 * minSpacing);
      ObjectSetInteger(0, SellTake1Line, OBJPROP_COLOR, clrBlue);
      ObjectSetInteger(0, SellTake1Line, OBJPROP_STYLE, STYLE_DOT);
      ObjectSetInteger(0, SellTake1Line, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, SellTake1Line, OBJPROP_BACK, false);
      ObjectSetInteger(0, SellTake1Line, OBJPROP_SELECTABLE, true);
      ObjectSetString(0, SellTake1Line, OBJPROP_TEXT, "SELL Take 1");
   }
   
   // Take 2 para venda (ciano)
   if(ObjectFind(0, SellTake2Line) < 0)
   {
      ObjectCreate(0, SellTake2Line, OBJ_HLINE, 0, 0, price - 3 * minSpacing);
      ObjectSetInteger(0, SellTake2Line, OBJPROP_COLOR, clrCyan);
      ObjectSetInteger(0, SellTake2Line, OBJPROP_STYLE, STYLE_DOT);
      ObjectSetInteger(0, SellTake2Line, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, SellTake2Line, OBJPROP_BACK, false);
      ObjectSetInteger(0, SellTake2Line, OBJPROP_SELECTABLE, true);
      ObjectSetString(0, SellTake2Line, OBJPROP_TEXT, "SELL Take 2");
   }
   
   // Take 3 para venda (amarelo) - mais baixo
   if(ObjectFind(0, SellTake3Line) < 0)
   {
      ObjectCreate(0, SellTake3Line, OBJ_HLINE, 0, 0, price - 4 * minSpacing);
      ObjectSetInteger(0, SellTake3Line, OBJPROP_COLOR, clrYellow);
      ObjectSetInteger(0, SellTake3Line, OBJPROP_STYLE, STYLE_DOT);
      ObjectSetInteger(0, SellTake3Line, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, SellTake3Line, OBJPROP_BACK, false);
      ObjectSetInteger(0, SellTake3Line, OBJPROP_SELECTABLE, true);
      ObjectSetString(0, SellTake3Line, OBJPROP_TEXT, "SELL Take 3");
   }
   
   LinesInitialized = true;
   
   // Criar labels imediatamente após criar as linhas
   UpdateAllLabels();
   ChartRedraw();
   Print("Linhas criadas com sucesso!");
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
      ObjectSetInteger(0, ButtonName, OBJPROP_BGCOLOR, clrDodgerBlue);
      ObjectSetInteger(0, ButtonName, OBJPROP_COLOR, clrWhite);
      ObjectSetInteger(0, ButtonName, OBJPROP_BORDER_COLOR, clrWhite);
      ObjectSetInteger(0, ButtonName, OBJPROP_CORNER, CORNER_LEFT_LOWER);
      ObjectSetString(0, ButtonName, OBJPROP_TEXT, "Enviar Sinal");
      ObjectSetInteger(0, ButtonName, OBJPROP_FONTSIZE, 10);
      ObjectSetInteger(0, ButtonName, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(0, ButtonName, OBJPROP_SELECTED, false);
      ChartRedraw();
   }
}

//+------------------------------------------------------------------+
//| Manipulador de clique no botão de envio                         |
//+------------------------------------------------------------------+
void OnSendButtonClick()
{
   Print("📤 Enviando sinais BUY e SELL...");
   
   // ========== ENVIAR SINAL BUY ==========
   double buyEntry = ObjectGetDouble(0, BuyEntryLine, OBJPROP_PRICE);
   double buyStopLoss = ObjectGetDouble(0, BuyStopLossLine, OBJPROP_PRICE);
   double buyTake1 = ObjectGetDouble(0, BuyTake1Line, OBJPROP_PRICE);
   double buyTake2 = ObjectGetDouble(0, BuyTake2Line, OBJPROP_PRICE);
   double buyTake3 = ObjectGetDouble(0, BuyTake3Line, OBJPROP_PRICE);
   
   // Calcular stopTicks para BUY
   double tickSize = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   int digits = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);
   
   if(tickSize <= 0)
   {
      double pointValue = SymbolInfoDouble(_Symbol, SYMBOL_POINT);
      if(digits == 3 || digits == 5)
         tickSize = pointValue * 10;
      else
         tickSize = pointValue;
   }
   
   double buyPriceDiff = MathAbs(buyEntry - buyStopLoss);
   int buyStopTicks = (int)MathRound(buyPriceDiff / tickSize);
   if(buyStopTicks <= 0)
      buyStopTicks = 1;
   
   // Resetar flags de monitoramento BUY ao enviar novo sinal
   BuyEntryHit = false;
   BuyStopHit = false;
   BuyTake1Hit = false;
   BuyTake2Hit = false;
   BuyTake3Hit = false;
   
   string buyId = SendSignal("BUY", buyEntry, buyStopLoss, buyTake1, buyTake2, buyTake3, buyStopTicks);
   bool buySuccess = (buyId != "");
   if(buySuccess)
      BuySignalId = buyId;
   
   // ========== ENVIAR SINAL SELL ==========
   double sellEntry = ObjectGetDouble(0, SellEntryLine, OBJPROP_PRICE);
   double sellStopLoss = ObjectGetDouble(0, SellStopLossLine, OBJPROP_PRICE);
   double sellTake1 = ObjectGetDouble(0, SellTake1Line, OBJPROP_PRICE);
   double sellTake2 = ObjectGetDouble(0, SellTake2Line, OBJPROP_PRICE);
   double sellTake3 = ObjectGetDouble(0, SellTake3Line, OBJPROP_PRICE);
   
   // Calcular stopTicks para SELL
   double sellPriceDiff = MathAbs(sellEntry - sellStopLoss);
   int sellStopTicks = (int)MathRound(sellPriceDiff / tickSize);
   if(sellStopTicks <= 0)
      sellStopTicks = 1;
   
   // Resetar flags de monitoramento SELL ao enviar novo sinal
   SellEntryHit = false;
   SellStopHit = false;
   SellTake1Hit = false;
   SellTake2Hit = false;
   SellTake3Hit = false;
   
   string sellId = SendSignal("SELL", sellEntry, sellStopLoss, sellTake1, sellTake2, sellTake3, sellStopTicks);
   bool sellSuccess = (sellId != "");
   if(sellSuccess)
      SellSignalId = sellId;
   
   // ========== RESULTADO ==========
   if(buySuccess && sellSuccess)
   {
      Alert("✅ Ambos os sinais enviados com sucesso!\n\nBUY: ✅\nSELL: ✅");
      Print("✅ Sinais BUY e SELL enviados com sucesso!");
   }
   else if(buySuccess && !sellSuccess)
   {
      Alert("⚠️ Sinal BUY enviado ✅\nSinal SELL falhou ❌");
      Print("✅ BUY enviado | ❌ SELL falhou");
   }
   else if(!buySuccess && sellSuccess)
   {
      Alert("⚠️ Sinal BUY falhou ❌\nSinal SELL enviado ✅");
      Print("❌ BUY falhou | ✅ SELL enviado");
   }
   else
   {
      Alert("❌ Erro ao enviar ambos os sinais.\n\nBUY: ❌\nSELL: ❌\n\nVerifique os logs.");
      Print("❌ Erro ao enviar sinais BUY e SELL");
   }
}

//+------------------------------------------------------------------+
//| Enviar sinal BUY quando preço atingir a linha                   |
//+------------------------------------------------------------------+
void SendBuySignal()
{
   double entry = ObjectGetDouble(0, BuyEntryLine, OBJPROP_PRICE);
   double stopLoss = ObjectGetDouble(0, BuyStopLossLine, OBJPROP_PRICE);
   double take1 = ObjectGetDouble(0, BuyTake1Line, OBJPROP_PRICE);
   double take2 = ObjectGetDouble(0, BuyTake2Line, OBJPROP_PRICE);
   double take3 = ObjectGetDouble(0, BuyTake3Line, OBJPROP_PRICE);
   
   // Calcular stopTicks
   double tickSize = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   int digits = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);
   
   if(tickSize <= 0)
   {
      double pointValue = SymbolInfoDouble(_Symbol, SYMBOL_POINT);
      if(digits == 3 || digits == 5)
         tickSize = pointValue * 10;
      else
         tickSize = pointValue;
   }
   
   double priceDiff = MathAbs(entry - stopLoss);
   int stopTicks = (int)MathRound(priceDiff / tickSize);
   if(stopTicks <= 0)
      stopTicks = 1;
   
   Print("🎯 BUY Signal detectado! Enviando...");
   Print("Entry: ", entry, " StopLoss: ", stopLoss, " Take1: ", take1);
   
   // Resetar flags de monitoramento ao enviar novo sinal
   BuyEntryHit = false;
   BuyStopHit = false;
   BuyTake1Hit = false;
   BuyTake2Hit = false;
   BuyTake3Hit = false;
   
   string signalId = SendSignal("BUY", entry, stopLoss, take1, take2, take3, stopTicks);
   
   if(signalId != "")
   {
      BuySignalId = signalId;
      Print("✅ Sinal BUY enviado com sucesso! ID: ", signalId);
      Alert("✅ Sinal BUY enviado para API! ID: " + signalId);
      lastSignalTime = TimeCurrent();
   }
   else
   {
      Print("❌ Erro ao enviar sinal BUY");
      BuySignalSent = false; // Permite tentar novamente
      BuySignalId = ""; // Limpar ID em caso de erro
   }
}

//+------------------------------------------------------------------+
//| Enviar sinal SELL quando preço atingir a linha                  |
//+------------------------------------------------------------------+
void SendSellSignal()
{
   double entry = ObjectGetDouble(0, SellEntryLine, OBJPROP_PRICE);
   double stopLoss = ObjectGetDouble(0, SellStopLossLine, OBJPROP_PRICE);
   double take1 = ObjectGetDouble(0, SellTake1Line, OBJPROP_PRICE);
   double take2 = ObjectGetDouble(0, SellTake2Line, OBJPROP_PRICE);
   double take3 = ObjectGetDouble(0, SellTake3Line, OBJPROP_PRICE);
   
   // Calcular stopTicks
   double tickSize = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   int digits = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);
   
   if(tickSize <= 0)
   {
      double pointValue = SymbolInfoDouble(_Symbol, SYMBOL_POINT);
      if(digits == 3 || digits == 5)
         tickSize = pointValue * 10;
      else
         tickSize = pointValue;
   }
   
   double priceDiff = MathAbs(entry - stopLoss);
   int stopTicks = (int)MathRound(priceDiff / tickSize);
   if(stopTicks <= 0)
      stopTicks = 1;
   
   Print("🎯 SELL Signal detectado! Enviando...");
   Print("Entry: ", entry, " StopLoss: ", stopLoss, " Take1: ", take1);
   
   // Resetar flags de monitoramento ao enviar novo sinal
   SellEntryHit = false;
   SellStopHit = false;
   SellTake1Hit = false;
   SellTake2Hit = false;
   SellTake3Hit = false;
   
   string signalId = SendSignal("SELL", entry, stopLoss, take1, take2, take3, stopTicks);
   
   if(signalId != "")
   {
      SellSignalId = signalId;
      Print("✅ Sinal SELL enviado com sucesso! ID: ", signalId);
      Alert("✅ Sinal SELL enviado para API! ID: " + signalId);
      lastSignalTime = TimeCurrent();
   }
   else
   {
      Print("❌ Erro ao enviar sinal SELL");
      SellSignalSent = false; // Permite tentar novamente
      SellSignalId = ""; // Limpar ID em caso de erro
   }
}

//+------------------------------------------------------------------+
//| Enviar sinal manualmente (retorna ID do sinal criado)           |
//+------------------------------------------------------------------+
string SendSignal(string signalType, double entry, double stopLoss, 
                double take1, double take2, double take3, int stopTicks)
{
   // Obter data/hora atual no formato "YYYY.MM.DD HH:MM:SS"
   datetime currentTime = TimeCurrent();
   MqlDateTime dt;
   TimeToStruct(currentTime, dt);
   string timeStr = StringFormat("%04d.%02d.%02d %02d:%02d:%02d", 
                                 dt.year, dt.mon, dt.day, 
                                 dt.hour, dt.min, dt.sec);
   
   int digits = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);
   
   // Preparar JSON
   string json = "{"
                 + "\"name\":\"TakePips\","
                 + "\"type\":\"" + signalType + "\","
                 + "\"symbol\":\"" + _Symbol + "\","
                 + "\"entry\":" + DoubleToString(entry, digits) + ","
                 + "\"stopLoss\":" + DoubleToString(stopLoss, digits) + ","
                 + "\"take1\":" + DoubleToString(take1, digits) + ","
                 + "\"take2\":" + DoubleToString(take2, digits) + ","
                 + "\"take3\":" + DoubleToString(take3, digits) + ","
                 + "\"stopTicks\":" + IntegerToString(stopTicks) + ","
                 + "\"time\":\"" + timeStr + "\""
                 + "}";
   
   return SendSignalToEndpoint(json);
}

//+------------------------------------------------------------------+
//| Testar conexão com a API                                        |
//+------------------------------------------------------------------+
void TestConnection()
{
   Print("=== TESTE DE CONEXÃO ===");
   Print("URL: ", EndpointURL);
   
   // Preparar dados de teste
   datetime currentTime = TimeCurrent();
   MqlDateTime dt;
   TimeToStruct(currentTime, dt);
   string timeStr = StringFormat("%04d.%02d.%02d %02d:%02d:%02d", 
                                 dt.year, dt.mon, dt.day, 
                                 dt.hour, dt.min, dt.sec);
   
   double currentPrice = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   int digits = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);
   
   // Criar JSON de teste
   string testJson = "{"
                    + "\"name\":\"TakePips\","
                    + "\"type\":\"BUY\","
                    + "\"symbol\":\"" + _Symbol + "\","
                    + "\"entry\":" + DoubleToString(currentPrice, digits) + ","
                    + "\"stopLoss\":" + DoubleToString(currentPrice * 0.999, digits) + ","
                    + "\"take1\":" + DoubleToString(currentPrice * 1.001, digits) + ","
                    + "\"take2\":" + DoubleToString(currentPrice * 1.002, digits) + ","
                    + "\"take3\":" + DoubleToString(currentPrice * 1.003, digits) + ","
                    + "\"stopTicks\":100,"
                    + "\"time\":\"" + timeStr + "\""
                    + "}";
   
   Print("Enviando requisição de teste...");
   
   // Preparar cabeçalhos HTTP
   string headers = "";
   headers = headers + "Content-Type: application/json\r\n";
   headers = headers + "User-Agent: MetaTrader5\r\n";
   
   // Preparar dados
   char post[];
   char result[];
   string result_headers;
   
   // Converter JSON para array de bytes - método correto
   int jsonLen = StringLen(testJson);
   // Adicionar Content-Length explicitamente
   headers = headers + "Content-Length: " + IntegerToString(jsonLen) + "\r\n";
   // Redimensionar array para o tamanho exato (sem terminador null)
   ArrayResize(post, jsonLen);
   // Converter string para array, sem incluir terminador null
   int copied = StringToCharArray(testJson, post, 0, jsonLen, CP_UTF8);
   // Ajustar tamanho do array para o número exato de bytes copiados
   if(copied > 0 && copied <= jsonLen)
   {
      ArrayResize(post, copied);
   }
   
   // Preparar array de resultado
   ArrayResize(result, 0);
   
   // Realizar requisição HTTP POST
   int timeout = 10000;
   ResetLastError();
   int res = WebRequest("POST", EndpointURL, headers, timeout, post, result, result_headers);
   
   string resultStr = CharArrayToString(result);
   
   if(res == -1)
   {
      int error = GetLastError();
      Print("❌ ERRO WebRequest: ", error);
      Print("URL tentada: ", EndpointURL);
      
      string errorMsg = "❌ FALHA NA CONEXÃO\n\n";
      errorMsg += "URL: " + EndpointURL + "\n";
      errorMsg += "Erro: " + IntegerToString(error) + "\n\n";
      
      if(error == 4060)
      {
         errorMsg += "⚠️ Erro 4060: URL não permitida.\n\n";
         errorMsg += "Adicione esta URL nas configurações:\n";
         errorMsg += "Tools -> Options -> Expert Advisors\n";
         errorMsg += "Marque: 'Allow WebRequest for listed URL'\n";
         errorMsg += "Adicione: " + EndpointURL;
      }
      else if(error == 4006)
      {
         errorMsg += "⚠️ Erro 4006: Problema com SSL/TLS (HTTPS).\n\n";
         errorMsg += "Soluções:\n";
         errorMsg += "1. Verifique se o MT5 está atualizado\n";
         errorMsg += "2. Adicione a URL nas URLs permitidas\n";
         errorMsg += "3. Reinicie o MT5 COMPLETAMENTE\n";
         errorMsg += "4. Se ainda não funcionar, use servidor local (HTTP)";
      }
      else if(error == 4014)
      {
         errorMsg += "⚠️ Erro 4014: Falha na conexão HTTP.\n\n";
         errorMsg += "Verifique:\n";
         errorMsg += "1. URL está correta?\n";
         errorMsg += "2. Servidor está online?\n";
         errorMsg += "3. Firewall não está bloqueando?";
      }
      
      Alert(errorMsg);
   }
   else if(res >= 200 && res < 300)
   {
      string successMsg = "✅ CONEXÃO OK!\n\n";
      successMsg += "URL: " + EndpointURL + "\n";
      successMsg += "Status: " + IntegerToString(res) + " (Sucesso)\n\n";
      successMsg += "Resposta do servidor:\n";
      
      if(StringLen(resultStr) > 200)
      {
         successMsg += StringSubstr(resultStr, 0, 200) + "...";
      }
      else
      {
         successMsg += resultStr;
      }
      
      Print("✅ SUCESSO! Status: ", res);
      Print("Resposta: ", resultStr);
      
      Alert(successMsg);
   }
   else
   {
      Print("⚠️ Status inesperado: ", res);
      Print("Resposta: ", resultStr);
      
      Alert("⚠️ RESPOSTA INESPERADA\n\nStatus: " + IntegerToString(res));
   }
   
   Print("=== FIM DO TESTE ===");
}

//+------------------------------------------------------------------+
//| Enviar sinal para o endpoint (retorna ID do sinal criado)        |
//+------------------------------------------------------------------+
string SendSignalToEndpoint(string jsonData)
{
   string url = EndpointURL;
   
   // Preparar cabeçalhos HTTP
   string headers = "";
   headers = headers + "Content-Type: application/json\r\n";
   headers = headers + "User-Agent: MetaTrader5\r\n";
   
   // Preparar dados
   char post[];
   char result[];
   string result_headers;
   
   // Converter JSON para array de bytes - método correto
   int jsonLen = StringLen(jsonData);
   // Adicionar Content-Length explicitamente
   headers = headers + "Content-Length: " + IntegerToString(jsonLen) + "\r\n";
   // Redimensionar array para o tamanho exato (sem terminador null)
   ArrayResize(post, jsonLen);
   // Converter string para array, sem incluir terminador null
   int copied = StringToCharArray(jsonData, post, 0, jsonLen, CP_UTF8);
   // Ajustar tamanho do array para o número exato de bytes copiados
   if(copied > 0 && copied <= jsonLen)
   {
      ArrayResize(post, copied);
   }
   
   // Preparar array de resultado
   ArrayResize(result, 0);
   
   // Realizar requisição HTTP POST
   int timeout = 5000;
   ResetLastError();
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
      else if(error == 4006)
      {
         string errorMsg = "Erro 4006: Problema com SSL/TLS (HTTPS).\n\n";
         errorMsg += "Soluções:\n";
         errorMsg += "1. Adicione a URL nas URLs permitidas\n";
         errorMsg += "2. Reinicie o MT5 COMPLETAMENTE\n";
         errorMsg += "3. Verifique se o MT5 está atualizado";
         Alert(errorMsg);
      }
      else if(error == 4014)
      {
         string errorMsg = "Erro 4014: Falha na conexão HTTP.\n\n";
         errorMsg += "Verifique:\n";
         errorMsg += "1. Servidor está rodando?\n";
         errorMsg += "2. URL está correta? " + url + "\n";
         errorMsg += "3. Firewall não está bloqueando?";
         Alert(errorMsg);
      }
      else
      {
         Alert("Erro WebRequest " + IntegerToString(error) + ": Falha ao enviar requisição.\n\nURL: " + url);
      }
      return "";
   }
   
   // Verificar código de resposta
   string responseStr = CharArrayToString(result);
   if(res >= 200 && res < 300)
   {
      Print("✅ Sinal enviado com sucesso. Status: ", res);
      Print("Resposta: ", responseStr);
      
      // Extrair ID do sinal da resposta JSON
      // Formato esperado: {"success":true,"data":{"id":"uuid-here",...}}
      string signalId = ExtractSignalId(responseStr);
      if(signalId != "")
      {
         Print("📝 ID do sinal capturado: ", signalId);
         return signalId;
      }
      else
      {
         Print("⚠️ Não foi possível extrair ID da resposta");
         return ""; // Retorna vazio mas indica sucesso
      }
   }
   else
   {
      Print("❌ Erro na resposta do servidor. Código: ", res);
      Print("Resposta: ", responseStr);
      return "";
   }
}

//+------------------------------------------------------------------+
//| Extrair ID do sinal da resposta JSON                            |
//+------------------------------------------------------------------+
string ExtractSignalId(string jsonResponse)
{
   // Procurar por "id" no JSON
   int idPos = StringFind(jsonResponse, "\"id\"");
   if(idPos == -1)
      return "";
   
   // Encontrar os dois pontos após "id"
   int colonPos = StringFind(jsonResponse, ":", idPos);
   if(colonPos == -1)
      return "";
   
   // Encontrar a primeira aspas após os dois pontos
   int quote1Pos = StringFind(jsonResponse, "\"", colonPos);
   if(quote1Pos == -1)
      return "";
   
   // Encontrar a segunda aspas (fim do ID)
   int quote2Pos = StringFind(jsonResponse, "\"", quote1Pos + 1);
   if(quote2Pos == -1)
      return "";
   
   // Extrair o ID entre as aspas
   string id = StringSubstr(jsonResponse, quote1Pos + 1, quote2Pos - quote1Pos - 1);
   return id;
}

//+------------------------------------------------------------------+
//| Monitorar níveis de preço e enviar atualizações                 |
//+------------------------------------------------------------------+
void MonitorPriceLevels()
{
   if(!LinesInitialized)
      return;
   
   // Obter preços atuais
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   
   // ========== MONITORAR SINAL BUY ==========
   if(BuySignalId != "")
   {
      double buyEntry = ObjectGetDouble(0, BuyEntryLine, OBJPROP_PRICE);
      double buyStopLoss = ObjectGetDouble(0, BuyStopLossLine, OBJPROP_PRICE);
      double buyTake1 = ObjectGetDouble(0, BuyTake1Line, OBJPROP_PRICE);
      double buyTake2 = ObjectGetDouble(0, BuyTake2Line, OBJPROP_PRICE);
      double buyTake3 = ObjectGetDouble(0, BuyTake3Line, OBJPROP_PRICE);
      
      // PRIMEIRO: Verificar se ENTRADA BUY foi atingida
      if(!BuyEntryHit && buyEntry > 0)
      {
         // Entrada BUY é ativada quando ASK (preço de compra) atinge ou ultrapassa a linha
         if(ask >= buyEntry - PriceTolerance)
         {
            BuyEntryHit = true;
            Print("✅ BUY Entry atingida! Preço: ", ask, " | Entry: ", buyEntry);
         }
      }
      
      // SÓ MONITORA STOP/TAKES SE A ENTRADA FOI ATINGIDA
      if(BuyEntryHit)
      {
         // Verificar se já atingiu algum TAKE (se sim, não monitora mais STOP)
         bool anyTakeHit = BuyTake1Hit || BuyTake2Hit || BuyTake3Hit;
         
         // Se STOP foi atingido → encerra completamente o monitoramento BUY
         if(BuyStopHit)
         {
            BuySignalId = "";
            Print("🛑 BUY Stop atingido. Monitoramento BUY encerrado.");
            // NOTA: Continua monitorando SELL se ainda estiver ativo
         }
         // Se TAKE3 foi atingido → encerra completamente o monitoramento BUY
         else if(BuyTake3Hit)
         {
            BuySignalId = "";
            Print("✅ BUY Take3 atingido. Monitoramento BUY encerrado.");
            // NOTA: Continua monitorando SELL se ainda estiver ativo
         }
         // Se ainda não finalizou, continua monitorando
         else
         {
            // Verificar TAKE 1 (preço subiu até take 1)
            if(!BuyTake1Hit && buyTake1 > 0 && ask >= buyTake1 - PriceTolerance)
            {
               BuyTake1Hit = true;
               UpdateSignalStatus(BuySignalId, "TAKE1", ask);
               Print("✅ BUY Take1 atingido. Continuando monitoramento de Take2 e Take3...");
               // NÃO encerra - continua monitorando TAKE2 e TAKE3
            }
            
            // Verificar TAKE 2 (preço subiu até take 2)
            if(!BuyTake2Hit && buyTake2 > 0 && ask >= buyTake2 - PriceTolerance)
            {
               BuyTake2Hit = true;
               UpdateSignalStatus(BuySignalId, "TAKE2", ask);
               Print("✅ BUY Take2 atingido. Continuando monitoramento de Take3...");
               // NÃO encerra - continua monitorando TAKE3
            }
            
            // Verificar TAKE 3 (preço subiu até take 3)
            if(!BuyTake3Hit && buyTake3 > 0 && ask >= buyTake3 - PriceTolerance)
            {
               BuyTake3Hit = true;
               UpdateSignalStatus(BuySignalId, "TAKE3", ask);
               // TAKE3 é o último → encerra monitoramento BUY
               BuySignalId = "";
               Print("✅ BUY Take3 atingido. Monitoramento BUY encerrado.");
               // NOTA: Continua monitorando SELL se ainda estiver ativo
            }
            
            // Verificar STOP LOSS (preço caiu abaixo do stop)
            // IMPORTANTE: Só monitora stop se NÃO atingiu nenhum take ainda
            if(!BuyStopHit && !anyTakeHit && buyStopLoss > 0 && bid <= buyStopLoss + PriceTolerance)
            {
               BuyStopHit = true;
               UpdateSignalStatus(BuySignalId, "STOP_LOSS", bid);
               // Quando stop é atingido, para de monitorar este sinal BUY
               BuySignalId = ""; // Limpa ID para parar monitoramento BUY
               Print("🛑 BUY Stop atingido. Monitoramento BUY encerrado.");
               // NOTA: Continua monitorando SELL se ainda estiver ativo
            }
         }
      }
   }
   
   // ========== MONITORAR SINAL SELL ==========
   if(SellSignalId != "")
   {
      double sellEntry = ObjectGetDouble(0, SellEntryLine, OBJPROP_PRICE);
      double sellStopLoss = ObjectGetDouble(0, SellStopLossLine, OBJPROP_PRICE);
      double sellTake1 = ObjectGetDouble(0, SellTake1Line, OBJPROP_PRICE);
      double sellTake2 = ObjectGetDouble(0, SellTake2Line, OBJPROP_PRICE);
      double sellTake3 = ObjectGetDouble(0, SellTake3Line, OBJPROP_PRICE);
      
      // PRIMEIRO: Verificar se ENTRADA SELL foi atingida
      if(!SellEntryHit && sellEntry > 0)
      {
         // Entrada SELL é ativada quando BID (preço de venda) atinge ou ultrapassa a linha
         if(bid <= sellEntry + PriceTolerance)
         {
            SellEntryHit = true;
            Print("✅ SELL Entry atingida! Preço: ", bid, " | Entry: ", sellEntry);
         }
      }
      
      // SÓ MONITORA STOP/TAKES SE A ENTRADA FOI ATINGIDA
      if(SellEntryHit)
      {
         // Verificar se já atingiu algum TAKE (se sim, não monitora mais STOP)
         bool anyTakeHit = SellTake1Hit || SellTake2Hit || SellTake3Hit;
         
         // Se STOP foi atingido → encerra completamente o monitoramento SELL
         if(SellStopHit)
         {
            SellSignalId = "";
            Print("🛑 SELL Stop atingido. Monitoramento SELL encerrado.");
            // NOTA: Continua monitorando BUY se ainda estiver ativo
         }
         // Se TAKE3 foi atingido → encerra completamente o monitoramento SELL
         else if(SellTake3Hit)
         {
            SellSignalId = "";
            Print("✅ SELL Take3 atingido. Monitoramento SELL encerrado.");
            // NOTA: Continua monitorando BUY se ainda estiver ativo
         }
         // Se ainda não finalizou, continua monitorando
         else
         {
            // Verificar TAKE 1 (preço caiu até take 1)
            if(!SellTake1Hit && sellTake1 > 0 && bid <= sellTake1 + PriceTolerance)
            {
               SellTake1Hit = true;
               UpdateSignalStatus(SellSignalId, "TAKE1", bid);
               Print("✅ SELL Take1 atingido. Continuando monitoramento de Take2 e Take3...");
               // NÃO encerra - continua monitorando TAKE2 e TAKE3
            }
            
            // Verificar TAKE 2 (preço caiu até take 2)
            if(!SellTake2Hit && sellTake2 > 0 && bid <= sellTake2 + PriceTolerance)
            {
               SellTake2Hit = true;
               UpdateSignalStatus(SellSignalId, "TAKE2", bid);
               Print("✅ SELL Take2 atingido. Continuando monitoramento de Take3...");
               // NÃO encerra - continua monitorando TAKE3
            }
            
            // Verificar TAKE 3 (preço caiu até take 3)
            if(!SellTake3Hit && sellTake3 > 0 && bid <= sellTake3 + PriceTolerance)
            {
               SellTake3Hit = true;
               UpdateSignalStatus(SellSignalId, "TAKE3", bid);
               // TAKE3 é o último → encerra monitoramento SELL
               SellSignalId = "";
               Print("✅ SELL Take3 atingido. Monitoramento SELL encerrado.");
               // NOTA: Continua monitorando BUY se ainda estiver ativo
            }
            
            // Verificar STOP LOSS (preço subiu acima do stop)
            // IMPORTANTE: Só monitora stop se NÃO atingiu nenhum take ainda
            if(!SellStopHit && !anyTakeHit && sellStopLoss > 0 && ask >= sellStopLoss - PriceTolerance)
            {
               SellStopHit = true;
               UpdateSignalStatus(SellSignalId, "STOP_LOSS", ask);
               // Quando stop é atingido, para de monitorar este sinal SELL
               SellSignalId = ""; // Limpa ID para parar monitoramento SELL
               Print("🛑 SELL Stop atingido. Monitoramento SELL encerrado.");
               // NOTA: Continua monitorando BUY se ainda estiver ativo
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Atualizar status do sinal na API                                 |
//+------------------------------------------------------------------+
void UpdateSignalStatus(string signalId, string status, double hitPrice)
{
   if(signalId == "")
   {
      Print("❌ Tentativa de atualizar status com ID vazio");
      return;
   }
   
   Print("📊 Atualizando status do sinal ", signalId, " para ", status, " no preço ", hitPrice);
   
   // Preparar URL do endpoint de atualização
   string updateUrl = EndpointURL;
   // Substituir "/signals" por "/signals/update-status"
   int signalsPos = StringFind(updateUrl, "/signals");
   if(signalsPos != -1)
   {
      // Extrair base URL (até /signals) e adicionar /update-status
      updateUrl = StringSubstr(updateUrl, 0, signalsPos) + "/signals/update-status";
   }
   else
   {
      // Se não encontrar, assumir padrão
      updateUrl = "https://takepips.vercel.app/api/signals/update-status";
   }
   
   int digits = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);
   
   // Preparar JSON
   string json = "{"
                 + "\"id\":\"" + signalId + "\","
                 + "\"status\":\"" + status + "\","
                 + "\"hitPrice\":" + DoubleToString(hitPrice, digits)
                 + "}";
   
   // Preparar cabeçalhos HTTP
   string headers = "";
   headers = headers + "Content-Type: application/json\r\n";
   headers = headers + "User-Agent: MetaTrader5\r\n";
   
   // Preparar dados
   char post[];
   char result[];
   string result_headers;
   
   // Converter JSON para array de bytes
   int jsonLen = StringLen(json);
   headers = headers + "Content-Length: " + IntegerToString(jsonLen) + "\r\n";
   ArrayResize(post, jsonLen);
   int copied = StringToCharArray(json, post, 0, jsonLen, CP_UTF8);
   if(copied > 0 && copied <= jsonLen)
   {
      ArrayResize(post, copied);
   }
   
   // Preparar array de resultado
   ArrayResize(result, 0);
   
   // Realizar requisição HTTP PATCH ou POST
   int timeout = 5000;
   ResetLastError();
   int res = WebRequest("POST", updateUrl, headers, timeout, post, result, result_headers);
   
   if(res == -1)
   {
      int error = GetLastError();
      Print("❌ Erro WebRequest ao atualizar status: ", error);
      Print("URL tentada: ", updateUrl);
      return;
   }
   
   string responseStr = CharArrayToString(result);
   if(res >= 200 && res < 300)
   {
      Print("✅ Status atualizado com sucesso! ", status, " @ ", hitPrice);
      Print("Resposta: ", responseStr);
   }
   else
   {
      Print("❌ Erro ao atualizar status. Código: ", res);
      Print("Resposta: ", responseStr);
   }
}

//+------------------------------------------------------------------+
