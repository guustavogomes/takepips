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
input bool   TestConnectionOnStart = false; // Testar conexão ao iniciar
input double PriceTolerance = 0.0001; // Tolerância para considerar que preço atingiu a linha

//--- Cores personalizáveis
input color   BuyEntryColor = clrLime; // Cor da linha de entrada BUY
input color   BuyStopColor = clrRed; // Cor da linha de stop loss BUY
input color   BuyTake1Color = clrBlue; // Cor da linha de take 1 BUY
input color   BuyTake2Color = clrCyan; // Cor da linha de take 2 BUY
input color   BuyTake3Color = clrYellow; // Cor da linha de take 3 BUY

input color   SellEntryColor = clrRed; // Cor da linha de entrada SELL
input color   SellStopColor = clrRed; // Cor da linha de stop loss SELL
input color   SellTake1Color = clrBlue; // Cor da linha de take 1 SELL
input color   SellTake2Color = clrCyan; // Cor da linha de take 2 SELL
input color   SellTake3Color = clrYellow; // Cor da linha de take 3 SELL

//--- Controle de acesso (contas autorizadas e período de validade)
long AuthorizedAccounts[] = {564998, 10184374, 9936253}; // Contas autorizadas
datetime LicenseStartDate = D'2024.11.02 00:00:00'; // Data de início da licença
int LicenseDays = 454; // Período de validade em dias (expira em 30/01/2026)
bool EAEnabled = false; // Flag para controlar se o EA está habilitado

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
string BuyButtonName = LinePrefix + "BuyButton";
string SellButtonName = LinePrefix + "SellButton";
string UpdateButtonName = LinePrefix + "UpdateButton";
string ResetButtonName = LinePrefix + "ResetButton";

//--- Variáveis de controle
bool LinesInitialized = false;
bool BuySignalSent = false; // Controla se já enviou sinal BUY
bool SellSignalSent = false; // Controla se já enviou sinal SELL
datetime lastSignalTime = 0;
datetime initializationTime = 0; // Timestamp da inicialização - usado para bloquear envio imediato
int initializationDelaySeconds = 5; // Delay mínimo em segundos após inicialização antes de permitir envio automático

//--- Variáveis para rastreamento de IDs e status
string BuySignalId = ""; // ID do sinal BUY retornado pela API
string SellSignalId = ""; // ID do sinal SELL retornado pela API
bool BuyEntryHit = false; // Se entrada BUY foi atingida (ativa EM_OPERACAO apenas UMA VEZ por sinal)
bool SellEntryHit = false; // Se entrada SELL foi atingida (ativa EM_OPERACAO apenas UMA VEZ por sinal)
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
   
   // Verificar autorização de conta
   long currentAccount = AccountInfoInteger(ACCOUNT_LOGIN);
   Print("Conta atual: ", currentAccount);
   
   bool accountAuthorized = false;
   for(int i = 0; i < ArraySize(AuthorizedAccounts); i++)
   {
      if(AuthorizedAccounts[i] == currentAccount)
      {
         accountAuthorized = true;
         Print("✅ Conta autorizada: ", currentAccount);
         break;
      }
   }
   
   if(!accountAuthorized)
   {
      string errorMsg = "❌ ERRO: Esta conta (" + IntegerToString(currentAccount) + ") não está autorizada!";
      Print(errorMsg);
      Alert(errorMsg);
      Comment(errorMsg);
      return(INIT_FAILED);
   }
   
   // Verificar período de validade (90 dias)
   datetime currentTime = TimeCurrent();
   datetime licenseEndDate = LicenseStartDate + (LicenseDays * 86400); // Adicionar 90 dias em segundos
   
   Print("Data de início da licença: ", TimeToString(LicenseStartDate, TIME_DATE|TIME_MINUTES));
   Print("Data de expiração da licença: ", TimeToString(licenseEndDate, TIME_DATE|TIME_MINUTES));
   Print("Data atual: ", TimeToString(currentTime, TIME_DATE|TIME_MINUTES));
   
   if(currentTime < LicenseStartDate)
   {
      string errorMsg = "❌ ERRO: Licença ainda não está ativa. Data de início: " + TimeToString(LicenseStartDate, TIME_DATE);
      Print(errorMsg);
      Alert(errorMsg);
      Comment(errorMsg);
      return(INIT_FAILED);
   }
   
   if(currentTime > licenseEndDate)
   {
      string errorMsg = "❌ ERRO: Licença expirada! Data de expiração: " + TimeToString(licenseEndDate, TIME_DATE);
      Print(errorMsg);
      Alert(errorMsg);
      Comment(errorMsg);
      return(INIT_FAILED);
   }
   
   // Calcular dias restantes
   int daysRemaining = (int)((licenseEndDate - currentTime) / 86400);
   Print("✅ Licença válida. Dias restantes: ", daysRemaining);
   
   EAEnabled = true;
   
   // ========== LIMPEZA COMPLETA DE ESTADOS ==========
   // LIMPAR TUDO: Resetar completamente todos os estados para evitar usar histórico antigo
   Print("🧹 Limpando TODOS os estados do Expert Advisor...");
   
   // Limpar IDs de sinais (CRÍTICO para evitar monitoramento de sinais antigos)
   BuySignalId = "";
   SellSignalId = "";
   
   // Limpar flags de envio de sinais
   BuySignalSent = !AutoSendSignals; // Se AutoSendSignals = false, marcar como já enviado (bloquear)
   SellSignalSent = !AutoSendSignals; // Se AutoSendSignals = false, marcar como já enviado (bloquear)
   
   // Limpar TODAS as flags de monitoramento BUY
   BuyEntryHit = false;
   BuyStopHit = false;
   BuyTake1Hit = false;
   BuyTake2Hit = false;
   BuyTake3Hit = false;
   
   // Limpar TODAS as flags de monitoramento SELL
   SellEntryHit = false;
   SellStopHit = false;
   SellTake1Hit = false;
   SellTake2Hit = false;
   SellTake3Hit = false;
   
   // Resetar timestamp do último sinal
   lastSignalTime = 0;
   
   // Limpar qualquer mensagem anterior no gráfico
   Comment("");
   
   Print("✅ Todos os estados foram limpos!");
   Print("🔒 AutoSendSignals: ", AutoSendSignals, " | Sinais automáticos: ", AutoSendSignals ? "ATIVADO" : "DESATIVADO");
   Print("📌 IMPORTANTE: O EA começará SEM histórico. Use os botões '📈 COMPRA' ou '📉 VENDA' para enviar sinais.");
   
   // Registrar tempo de inicialização para bloquear envio imediato
   initializationTime = TimeCurrent();
   Print("⏱️ Bloqueio de ", initializationDelaySeconds, " segundos ativado após inicialização para evitar envio automático imediato.");
   
   // Criar linhas se não existirem
   CreateLinesIfNeeded();
   
   // Atualizar cores das linhas existentes para refletir configurações personalizadas
   UpdateLineColors();

   // Criar botões
   CreateBuyButton();
   CreateSellButton();
   CreateUpdateButton();
   CreateResetButton();
   
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

   // Deletar botões
   ObjectDelete(0, BuyButtonName);
   ObjectDelete(0, SellButtonName);
   ObjectDelete(0, UpdateButtonName);
   ObjectDelete(0, ResetButtonName);
   
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
      if(sparam == BuyButtonName)
      {
         OnBuyButtonClick();
      }
      else if(sparam == SellButtonName)
      {
         OnSellButtonClick();
      }
      else if(sparam == UpdateButtonName)
      {
         OnUpdateButtonClick();
      }
      else if(sparam == ResetButtonName)
      {
         OnResetButtonClick();
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
   // Verificar se EA está habilitado
   if(!EAEnabled)
      return;
   
   // Verificar novamente se a licença ainda está válida (a cada hora)
   static datetime lastLicenseCheck = 0;
   datetime currentTime = TimeCurrent();
   
   if(currentTime - lastLicenseCheck >= 3600) // Verificar a cada hora
   {
      datetime licenseEndDate = LicenseStartDate + (LicenseDays * 86400);
      if(currentTime > licenseEndDate)
      {
         string errorMsg = "❌ Licença expirada! Data de expiração: " + TimeToString(licenseEndDate, TIME_DATE);
         Print(errorMsg);
         Alert(errorMsg);
         Comment(errorMsg);
         EAEnabled = false;
         ExpertRemove(); // Remover o EA do gráfico
         return;
      }
      lastLicenseCheck = currentTime;
   }
   
   // Atualizar labels periodicamente (a cada segundo)
   static datetime lastLabelUpdate = 0;
   
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
   
   // BLOQUEIO CRÍTICO: Não enviar sinais automaticamente se AutoSendSignals estiver desativado
   if(!AutoSendSignals)
   {
      // Se AutoSendSignals está desativado, garantir que as flags estejam bloqueadas
      if(!BuySignalSent)
         BuySignalSent = true; // Bloquear envio automático BUY
      if(!SellSignalSent)
         SellSignalSent = true; // Bloquear envio automático SELL
      return; // SAIR imediatamente - não processar envio automático
   }
   
   // Se AutoSendSignals está ativo mas linhas não estão inicializadas, sair
   if(!LinesInitialized)
      return;
   
   // ========== LÓGICA DE ENVIO AUTOMÁTICO ==========
   // CRÍTICO: O envio automático SÓ funciona se já existe um sinal enviado manualmente
   // Isso significa que AutoSendSignals só funciona para ENVIAR NOVOS SINAIS
   // quando já existe pelo menos um sinal sendo monitorado (BuySignalId ou SellSignalId)
   // 
   // REGRA: 
   // - Primeiro sinal DEVE ser enviado manualmente via botão
   // - Depois disso, AutoSendSignals pode enviar novos sinais automaticamente
   // - Não faz sentido "atualizar" um sinal que nunca foi enviado!
   
   bool hasActiveSignals = (BuySignalId != "" || SellSignalId != "");
   
   // Se não há sinais ativos e AutoSendSignals está ativo, bloquear envio automático
   // Primeiro sinal SEMPRE deve ser manual
   if(!hasActiveSignals && AutoSendSignals)
   {
      static bool firstAutoBlockWarning = true;
      if(firstAutoBlockWarning)
      {
         Print("🔒 Envio automático bloqueado: Nenhum sinal foi enviado manualmente ainda.");
         Print("📌 Primeiro envie um sinal manualmente usando os botões '📈 COMPRA' ou '📉 VENDA', depois o envio automático será habilitado.");
         firstAutoBlockWarning = false;
      }
      return; // Bloquear envio automático até que haja um sinal manual
   }
   
   // Se AutoSendSignals está desativado, não processar envio automático
   if(!AutoSendSignals)
      return;
   
   // CRÍTICO: Bloquear envio automático nos primeiros segundos após inicialização
   // Isso evita que sinais sejam enviados imediatamente quando linhas são criadas no preço atual
   // NOTA: currentTime já foi declarado no início da função, apenas reutilizar
   if(initializationTime > 0 && (currentTime - initializationTime) < initializationDelaySeconds)
   {
      // Ainda está no período de bloqueio - não enviar sinais automaticamente
      static bool firstBlockWarning = true;
      if(firstBlockWarning)
      {
         Print("⏸️ Envio automático bloqueado por mais ", initializationDelaySeconds - (int)(currentTime - initializationTime), " segundos após inicialização.");
         firstBlockWarning = false;
      }
      return; // SAIR sem processar envio automático
   }
   
   // Obter preços atuais
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   
   // Verificar se preço atingiu linha de entrada BUY
   // IMPORTANTE: Só enviar BUY automaticamente se já existe um sinal SELL sendo monitorado
   // NÃO re-enviar BUY se já tem BUY ativo (evita sobrescrever o ID atual)
   if(!BuySignalSent && BuySignalId == "" && SellSignalId != "")
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
   // IMPORTANTE: Só enviar SELL automaticamente se já existe um sinal BUY sendo monitorado
   // NÃO re-enviar SELL se já tem SELL ativo (evita sobrescrever o ID atual)
   if(!SellSignalSent && SellSignalId == "" && BuySignalId != "")
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
   
   // Take 3 para compra - mais alto
   if(ObjectFind(0, BuyTake3Line) < 0)
   {
      ObjectCreate(0, BuyTake3Line, OBJ_HLINE, 0, 0, price + 4 * minSpacing);
      ObjectSetInteger(0, BuyTake3Line, OBJPROP_COLOR, BuyTake3Color);
      ObjectSetInteger(0, BuyTake3Line, OBJPROP_STYLE, STYLE_DOT);
      ObjectSetInteger(0, BuyTake3Line, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, BuyTake3Line, OBJPROP_BACK, false);
      ObjectSetInteger(0, BuyTake3Line, OBJPROP_SELECTABLE, true);
      ObjectSetString(0, BuyTake3Line, OBJPROP_TEXT, "BUY Take 3");
   }
   
   // Take 2 para compra
   if(ObjectFind(0, BuyTake2Line) < 0)
   {
      ObjectCreate(0, BuyTake2Line, OBJ_HLINE, 0, 0, price + 3 * minSpacing);
      ObjectSetInteger(0, BuyTake2Line, OBJPROP_COLOR, BuyTake2Color);
      ObjectSetInteger(0, BuyTake2Line, OBJPROP_STYLE, STYLE_DOT);
      ObjectSetInteger(0, BuyTake2Line, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, BuyTake2Line, OBJPROP_BACK, false);
      ObjectSetInteger(0, BuyTake2Line, OBJPROP_SELECTABLE, true);
      ObjectSetString(0, BuyTake2Line, OBJPROP_TEXT, "BUY Take 2");
   }
   
   // Take 1 para compra
   if(ObjectFind(0, BuyTake1Line) < 0)
   {
      ObjectCreate(0, BuyTake1Line, OBJ_HLINE, 0, 0, price + 2 * minSpacing);
      ObjectSetInteger(0, BuyTake1Line, OBJPROP_COLOR, BuyTake1Color);
      ObjectSetInteger(0, BuyTake1Line, OBJPROP_STYLE, STYLE_DOT);
      ObjectSetInteger(0, BuyTake1Line, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, BuyTake1Line, OBJPROP_BACK, false);
      ObjectSetInteger(0, BuyTake1Line, OBJPROP_SELECTABLE, true);
      ObjectSetString(0, BuyTake1Line, OBJPROP_TEXT, "BUY Take 1");
   }
   
   // Linha de entrada para compra
   if(ObjectFind(0, BuyEntryLine) < 0)
   {
      ObjectCreate(0, BuyEntryLine, OBJ_HLINE, 0, 0, price);
      ObjectSetInteger(0, BuyEntryLine, OBJPROP_COLOR, BuyEntryColor);
      ObjectSetInteger(0, BuyEntryLine, OBJPROP_STYLE, STYLE_SOLID);
      ObjectSetInteger(0, BuyEntryLine, OBJPROP_WIDTH, 2);
      ObjectSetInteger(0, BuyEntryLine, OBJPROP_BACK, false);
      ObjectSetInteger(0, BuyEntryLine, OBJPROP_SELECTABLE, true);
      ObjectSetString(0, BuyEntryLine, OBJPROP_TEXT, "BUY Entry");
   }
   
   // Stop Loss para compra - mais baixo
   if(ObjectFind(0, BuyStopLossLine) < 0)
   {
      ObjectCreate(0, BuyStopLossLine, OBJ_HLINE, 0, 0, price - minSpacing);
      ObjectSetInteger(0, BuyStopLossLine, OBJPROP_COLOR, BuyStopColor);
      ObjectSetInteger(0, BuyStopLossLine, OBJPROP_STYLE, STYLE_DASH);
      ObjectSetInteger(0, BuyStopLossLine, OBJPROP_WIDTH, 2);
      ObjectSetInteger(0, BuyStopLossLine, OBJPROP_BACK, false);
      ObjectSetInteger(0, BuyStopLossLine, OBJPROP_SELECTABLE, true);
      ObjectSetString(0, BuyStopLossLine, OBJPROP_TEXT, "BUY Stop Loss");
   }
   
   // ========== LINHAS PARA VENDA (SELL) ==========
   // Ordem de cima para baixo: Stop, Entry, Take1, Take2, Take3
   
   // Stop Loss para venda - mais alto
   if(ObjectFind(0, SellStopLossLine) < 0)
   {
      ObjectCreate(0, SellStopLossLine, OBJ_HLINE, 0, 0, price + minSpacing);
      ObjectSetInteger(0, SellStopLossLine, OBJPROP_COLOR, SellStopColor);
      ObjectSetInteger(0, SellStopLossLine, OBJPROP_STYLE, STYLE_DASH);
      ObjectSetInteger(0, SellStopLossLine, OBJPROP_WIDTH, 2);
      ObjectSetInteger(0, SellStopLossLine, OBJPROP_BACK, false);
      ObjectSetInteger(0, SellStopLossLine, OBJPROP_SELECTABLE, true);
      ObjectSetString(0, SellStopLossLine, OBJPROP_TEXT, "SELL Stop Loss");
   }
   
   // Linha de entrada para venda
   if(ObjectFind(0, SellEntryLine) < 0)
   {
      ObjectCreate(0, SellEntryLine, OBJ_HLINE, 0, 0, price);
      ObjectSetInteger(0, SellEntryLine, OBJPROP_COLOR, SellEntryColor);
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
      ObjectSetInteger(0, SellTake1Line, OBJPROP_COLOR, SellTake1Color);
      ObjectSetInteger(0, SellTake1Line, OBJPROP_STYLE, STYLE_DOT);
      ObjectSetInteger(0, SellTake1Line, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, SellTake1Line, OBJPROP_BACK, false);
      ObjectSetInteger(0, SellTake1Line, OBJPROP_SELECTABLE, true);
      ObjectSetString(0, SellTake1Line, OBJPROP_TEXT, "SELL Take 1");
   }
   
   // Take 2 para venda
   if(ObjectFind(0, SellTake2Line) < 0)
   {
      ObjectCreate(0, SellTake2Line, OBJ_HLINE, 0, 0, price - 3 * minSpacing);
      ObjectSetInteger(0, SellTake2Line, OBJPROP_COLOR, SellTake2Color);
      ObjectSetInteger(0, SellTake2Line, OBJPROP_STYLE, STYLE_DOT);
      ObjectSetInteger(0, SellTake2Line, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, SellTake2Line, OBJPROP_BACK, false);
      ObjectSetInteger(0, SellTake2Line, OBJPROP_SELECTABLE, true);
      ObjectSetString(0, SellTake2Line, OBJPROP_TEXT, "SELL Take 2");
   }
   
   // Take 3 para venda - mais baixo
   if(ObjectFind(0, SellTake3Line) < 0)
   {
      ObjectCreate(0, SellTake3Line, OBJ_HLINE, 0, 0, price - 4 * minSpacing);
      ObjectSetInteger(0, SellTake3Line, OBJPROP_COLOR, SellTake3Color);
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
   // Labels para BUY (usando cores personalizadas)
   CreateLineLabel(BuyEntryLine, "BUY Entry", BuyEntryColor);
   CreateLineLabel(BuyStopLossLine, "BUY Stop", BuyStopColor);
   CreateLineLabel(BuyTake1Line, "BUY Take 1", BuyTake1Color);
   CreateLineLabel(BuyTake2Line, "BUY Take 2", BuyTake2Color);
   CreateLineLabel(BuyTake3Line, "BUY Take 3", BuyTake3Color);
   
   // Labels para SELL (usando cores personalizadas)
   CreateLineLabel(SellEntryLine, "SELL Entry", SellEntryColor);
   CreateLineLabel(SellStopLossLine, "SELL Stop", SellStopColor);
   CreateLineLabel(SellTake1Line, "SELL Take 1", SellTake1Color);
   CreateLineLabel(SellTake2Line, "SELL Take 2", SellTake2Color);
   CreateLineLabel(SellTake3Line, "SELL Take 3", SellTake3Color);
}

//+------------------------------------------------------------------+
//| Atualizar cores das linhas com configurações personalizadas     |
//+------------------------------------------------------------------+
void UpdateLineColors()
{
   // Atualizar cores das linhas BUY se existirem
   if(ObjectFind(0, BuyEntryLine) >= 0)
      ObjectSetInteger(0, BuyEntryLine, OBJPROP_COLOR, BuyEntryColor);
   if(ObjectFind(0, BuyStopLossLine) >= 0)
      ObjectSetInteger(0, BuyStopLossLine, OBJPROP_COLOR, BuyStopColor);
   if(ObjectFind(0, BuyTake1Line) >= 0)
      ObjectSetInteger(0, BuyTake1Line, OBJPROP_COLOR, BuyTake1Color);
   if(ObjectFind(0, BuyTake2Line) >= 0)
      ObjectSetInteger(0, BuyTake2Line, OBJPROP_COLOR, BuyTake2Color);
   if(ObjectFind(0, BuyTake3Line) >= 0)
      ObjectSetInteger(0, BuyTake3Line, OBJPROP_COLOR, BuyTake3Color);
   
   // Atualizar cores das linhas SELL se existirem
   if(ObjectFind(0, SellEntryLine) >= 0)
      ObjectSetInteger(0, SellEntryLine, OBJPROP_COLOR, SellEntryColor);
   if(ObjectFind(0, SellStopLossLine) >= 0)
      ObjectSetInteger(0, SellStopLossLine, OBJPROP_COLOR, SellStopColor);
   if(ObjectFind(0, SellTake1Line) >= 0)
      ObjectSetInteger(0, SellTake1Line, OBJPROP_COLOR, SellTake1Color);
   if(ObjectFind(0, SellTake2Line) >= 0)
      ObjectSetInteger(0, SellTake2Line, OBJPROP_COLOR, SellTake2Color);
   if(ObjectFind(0, SellTake3Line) >= 0)
      ObjectSetInteger(0, SellTake3Line, OBJPROP_COLOR, SellTake3Color);
}

//+------------------------------------------------------------------+
//| Criar botão de compra (BUY)                                     |
//+------------------------------------------------------------------+
void CreateBuyButton()
{
   int x = 10;
   int y = 30;
   int width = 150;
   int height = 30;

   if(ObjectFind(0, BuyButtonName) < 0)
   {
      ObjectCreate(0, BuyButtonName, OBJ_BUTTON, 0, 0, 0);
      ObjectSetInteger(0, BuyButtonName, OBJPROP_XDISTANCE, x);
      ObjectSetInteger(0, BuyButtonName, OBJPROP_YDISTANCE, y);
      ObjectSetInteger(0, BuyButtonName, OBJPROP_XSIZE, width);
      ObjectSetInteger(0, BuyButtonName, OBJPROP_YSIZE, height);
      ObjectSetInteger(0, BuyButtonName, OBJPROP_BGCOLOR, clrLimeGreen); // Verde
      ObjectSetInteger(0, BuyButtonName, OBJPROP_COLOR, clrWhite);
      ObjectSetInteger(0, BuyButtonName, OBJPROP_BORDER_COLOR, clrWhite);
      ObjectSetInteger(0, BuyButtonName, OBJPROP_CORNER, CORNER_LEFT_LOWER);
      ObjectSetString(0, BuyButtonName, OBJPROP_TEXT, "📈 COMPRA");
      ObjectSetInteger(0, BuyButtonName, OBJPROP_FONTSIZE, 11);
      ObjectSetInteger(0, BuyButtonName, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(0, BuyButtonName, OBJPROP_SELECTED, false);
      ChartRedraw();
   }
}

//+------------------------------------------------------------------+
//| Criar botão de venda (SELL)                                      |
//+------------------------------------------------------------------+
void CreateSellButton()
{
   int x = 170; // Ao lado do botão de compra
   int y = 30;
   int width = 150;
   int height = 30;

   if(ObjectFind(0, SellButtonName) < 0)
   {
      ObjectCreate(0, SellButtonName, OBJ_BUTTON, 0, 0, 0);
      ObjectSetInteger(0, SellButtonName, OBJPROP_XDISTANCE, x);
      ObjectSetInteger(0, SellButtonName, OBJPROP_YDISTANCE, y);
      ObjectSetInteger(0, SellButtonName, OBJPROP_XSIZE, width);
      ObjectSetInteger(0, SellButtonName, OBJPROP_YSIZE, height);
      ObjectSetInteger(0, SellButtonName, OBJPROP_BGCOLOR, clrCrimson); // Vermelho
      ObjectSetInteger(0, SellButtonName, OBJPROP_COLOR, clrWhite);
      ObjectSetInteger(0, SellButtonName, OBJPROP_BORDER_COLOR, clrWhite);
      ObjectSetInteger(0, SellButtonName, OBJPROP_CORNER, CORNER_LEFT_LOWER);
      ObjectSetString(0, SellButtonName, OBJPROP_TEXT, "📉 VENDA");
      ObjectSetInteger(0, SellButtonName, OBJPROP_FONTSIZE, 11);
      ObjectSetInteger(0, SellButtonName, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(0, SellButtonName, OBJPROP_SELECTED, false);
      ChartRedraw();
   }
}

//+------------------------------------------------------------------+
//| Criar botão de atualização                                       |
//+------------------------------------------------------------------+
void CreateUpdateButton()
{
   int x = 330; // Ao lado dos botões de compra/venda
   int y = 30;
   int width = 150;
   int height = 30;
   
   if(ObjectFind(0, UpdateButtonName) < 0)
   {
      ObjectCreate(0, UpdateButtonName, OBJ_BUTTON, 0, 0, 0);
      ObjectSetInteger(0, UpdateButtonName, OBJPROP_XDISTANCE, x);
      ObjectSetInteger(0, UpdateButtonName, OBJPROP_YDISTANCE, y);
      ObjectSetInteger(0, UpdateButtonName, OBJPROP_XSIZE, width);
      ObjectSetInteger(0, UpdateButtonName, OBJPROP_YSIZE, height);
      ObjectSetInteger(0, UpdateButtonName, OBJPROP_BGCOLOR, clrOrange);
      ObjectSetInteger(0, UpdateButtonName, OBJPROP_COLOR, clrWhite);
      ObjectSetInteger(0, UpdateButtonName, OBJPROP_BORDER_COLOR, clrWhite);
      ObjectSetInteger(0, UpdateButtonName, OBJPROP_CORNER, CORNER_LEFT_LOWER);
      ObjectSetString(0, UpdateButtonName, OBJPROP_TEXT, "Atualizar Sinal");
      ObjectSetInteger(0, UpdateButtonName, OBJPROP_FONTSIZE, 10);
      ObjectSetInteger(0, UpdateButtonName, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(0, UpdateButtonName, OBJPROP_HIDDEN, true);
      ChartRedraw();
   }
}

//+------------------------------------------------------------------+
//| Manipulador de clique no botão de atualização                    |
//+------------------------------------------------------------------+
void OnUpdateButtonClick()
{
   if(!EAEnabled)
   {
      Alert("❌ EA não está habilitado. Verifique a autorização da conta e validade da licença.");
      Print("❌ Tentativa de atualização bloqueada. EA não habilitado.");
      return;
   }

   // Verificar se há sinais ativos (não encerrados)
   // Um sinal é considerado encerrado se atingiu QUALQUER take (1, 2 ou 3) ou stop loss
   bool hasBuyActive = (BuySignalId != "" && !BuyTake1Hit && !BuyTake2Hit && !BuyTake3Hit && !BuyStopHit);
   bool hasSellActive = (SellSignalId != "" && !SellTake1Hit && !SellTake2Hit && !SellTake3Hit && !SellStopHit);

   if(!hasBuyActive && !hasSellActive)
   {
      if(BuySignalId == "" && SellSignalId == "")
      {
         Alert("⚠️ Nenhum sinal ativo para atualizar.\n\nUse os botões '📈 COMPRA' ou '📉 VENDA' para enviar novos sinais.");
         Print("⚠️ Tentativa de atualizar sem sinal ativo.");
      }
      else
      {
         Alert("⚠️ Os sinais já foram encerrados (Take ou Stop Loss atingido).\n\nNão é possível atualizar sinais que já atingiram algum alvo.");
         Print("⚠️ Sinais já encerrados.");
         if(BuySignalId != "")
            Print("BUY - Take1:", BuyTake1Hit, " Take2:", BuyTake2Hit, " Take3:", BuyTake3Hit, " Stop:", BuyStopHit);
         if(SellSignalId != "")
            Print("SELL - Take1:", SellTake1Hit, " Take2:", SellTake2Hit, " Take3:", SellTake3Hit, " Stop:", SellStopHit);
      }
      return;
   }

   Print("📝 Atualizando sinais ativos...");

   // Mostrar quais sinais serão atualizados
   if(hasBuyActive)
      Print("📊 Atualizando sinal BUY ativo (ID: ", BuySignalId, ")");

   if(hasSellActive)
      Print("📊 Atualizando sinal SELL ativo (ID: ", SellSignalId, ")");

   // Atualizar sinais (a função já verifica internamente quais IDs existem)
   UpdateSignalFromLines();

   // Mensagem de sucesso
   if(hasBuyActive && hasSellActive)
   {
      Alert("✅ Sinais BUY e SELL atualizados com sucesso!\n\n",
            "BUY: ID ", StringSubstr(BuySignalId, 0, 8), "...\n",
            "SELL: ID ", StringSubstr(SellSignalId, 0, 8), "...");
      Print("✅ 2 sinais atualizados com sucesso!");
   }
   else if(hasBuyActive)
   {
      Alert("✅ Sinal de COMPRA atualizado com sucesso!\n\n",
            "ID: ", StringSubstr(BuySignalId, 0, 8), "...");
      Print("✅ Sinal BUY atualizado com sucesso!");
   }
   else if(hasSellActive)
   {
      Alert("✅ Sinal de VENDA atualizado com sucesso!\n\n",
            "ID: ", StringSubstr(SellSignalId, 0, 8), "...");
      Print("✅ Sinal SELL atualizado com sucesso!");
   }
}

//+------------------------------------------------------------------+
//| Criar botão de reset                                             |
//+------------------------------------------------------------------+
void CreateResetButton()
{
   int x = 490; // Ao lado do botão de atualização
   int y = 30;
   int width = 120;
   int height = 30;
   
   if(ObjectFind(0, ResetButtonName) < 0)
   {
      ObjectCreate(0, ResetButtonName, OBJ_BUTTON, 0, 0, 0);
      ObjectSetInteger(0, ResetButtonName, OBJPROP_XDISTANCE, x);
      ObjectSetInteger(0, ResetButtonName, OBJPROP_YDISTANCE, y);
      ObjectSetInteger(0, ResetButtonName, OBJPROP_XSIZE, width);
      ObjectSetInteger(0, ResetButtonName, OBJPROP_YSIZE, height);
      ObjectSetInteger(0, ResetButtonName, OBJPROP_BGCOLOR, clrDarkRed);
      ObjectSetInteger(0, ResetButtonName, OBJPROP_COLOR, clrWhite);
      ObjectSetInteger(0, ResetButtonName, OBJPROP_BORDER_COLOR, clrWhite);
      ObjectSetInteger(0, ResetButtonName, OBJPROP_CORNER, CORNER_LEFT_LOWER);
      ObjectSetString(0, ResetButtonName, OBJPROP_TEXT, "Resetar");
      ObjectSetInteger(0, ResetButtonName, OBJPROP_FONTSIZE, 10);
      ObjectSetInteger(0, ResetButtonName, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(0, ResetButtonName, OBJPROP_HIDDEN, true);
      ChartRedraw();
   }
}

//+------------------------------------------------------------------+
//| Manipulador de clique no botão de reset                           |
//+------------------------------------------------------------------+
void OnResetButtonClick()
{
   if(!EAEnabled)
   {
      Alert("❌ EA não está habilitado. Verifique a autorização da conta e validade da licença.");
      Print("❌ Tentativa de reset bloqueada. EA não habilitado.");
      return;
   }
   
   if(BuySignalId == "" && SellSignalId == "")
   {
      Alert("⚠️ Nenhum sinal está sendo monitorado.\n\nNão há nada para resetar.");
      Print("⚠️ Tentativa de reset sem sinais ativos.");
      return;
   }
   
   // Confirmar com usuário
   if(MessageBox("Deseja realmente resetar o monitoramento?\n\nIsso encerrará o(s) sinal(is) e parará o monitoramento.", 
                 "Confirmar Reset", MB_YESNO | MB_ICONQUESTION) != IDYES)
   {
      Print("Reset cancelado pelo usuário.");
      return;
   }
   
   // ========== LIMPAR LOG DO EXPERT ==========
   // Imprimir múltiplas linhas em branco para separar visualmente o log
   // Isso ajuda a limpar a confusão de logs antigos
   Print("");
   Print("═══════════════════════════════════════════════════════════════");
   Print("🔄 RESET EXECUTADO - LOG LIMPO");
   Print("═══════════════════════════════════════════════════════════════");
   Print("");
   Print("");
   Print("");
   
   Print("🔄 Resetando monitoramento de sinais...");
   
   // Encerrar sinal BUY se existir
   if(BuySignalId != "")
   {
      EncerrarSignal(BuySignalId);
      BuySignalId = "";
      BuyEntryHit = false;
      BuyStopHit = false;
      BuyTake1Hit = false;
      BuyTake2Hit = false;
      BuyTake3Hit = false;
      BuySignalSent = false;
      Print("✅ Sinal BUY resetado");
   }
   
   // Encerrar sinal SELL se existir
   if(SellSignalId != "")
   {
      EncerrarSignal(SellSignalId);
      SellSignalId = "";
      SellEntryHit = false;
      SellStopHit = false;
      SellTake1Hit = false;
      SellTake2Hit = false;
      SellTake3Hit = false;
      SellSignalSent = false;
      Print("✅ Sinal SELL resetado");
   }
   
   // Limpar mensagem do gráfico
   Comment("");
   
   Print("═══════════════════════════════════════════════════════════════");
   Print("✅ Reset concluído! Todos os estados foram limpos.");
   Print("📌 Pronto para enviar novos sinais manualmente.");
   Print("═══════════════════════════════════════════════════════════════");
   Print("");
   Print("");
   Print("");
   
   Alert("✅ Monitoramento resetado!\n\nOs sinais foram encerrados e você pode enviar novos sinais.");
}

//+------------------------------------------------------------------+
//| Encerrar sinal na API                                             |
//+------------------------------------------------------------------+
void EncerrarSignal(string signalId)
{
   if(signalId == "")
   {
      Print("❌ Tentativa de encerrar sinal com ID vazio");
      return;
   }
   
   Print("🛑 Encerrando sinal ", signalId, " na API...");
   
   // Preparar URL do endpoint de encerramento
   string encerrarUrl = EndpointURL;
   // Substituir "/signals" por "/signals/" + signalId + "/encerrar"
   int signalsPos = StringFind(encerrarUrl, "/signals");
   if(signalsPos != -1)
   {
      // Extrair base URL (até /api) e adicionar /signals/[id]/encerrar
      int apiPos = StringFind(encerrarUrl, "/api");
      if(apiPos != -1)
      {
         encerrarUrl = StringSubstr(encerrarUrl, 0, apiPos) + "/api/signals/" + signalId + "/encerrar";
      }
      else
      {
         encerrarUrl = "https://takepips.vercel.app/api/signals/" + signalId + "/encerrar";
      }
   }
   else
   {
      encerrarUrl = "https://takepips.vercel.app/api/signals/" + signalId + "/encerrar";
   }
   
   // Preparar cabeçalhos HTTP
   string headers = "";
   headers = headers + "Content-Type: application/json\r\n";
   headers = headers + "User-Agent: MetaTrader5\r\n";
   
   // Preparar dados (POST vazio, apenas o ID vem na URL)
   char post[];
   char result[];
   string result_headers;
   
   ArrayResize(post, 0);
   ArrayResize(result, 0);
   
   // Realizar requisição HTTP POST
   int timeout = 5000;
   ResetLastError();
   int res = WebRequest("POST", encerrarUrl, headers, timeout, post, result, result_headers);
   
   if(res == -1)
   {
      int error = GetLastError();
      Print("❌ Erro WebRequest ao encerrar sinal: ", error);
      Print("URL tentada: ", encerrarUrl);
      return;
   }
   
   string responseStr = CharArrayToString(result);
   if(res >= 200 && res < 300)
   {
      Print("✅ Sinal encerrado com sucesso!");
      Print("Resposta: ", responseStr);
   }
   else
   {
      Print("❌ Erro ao encerrar sinal. Código: ", res);
      Print("Resposta: ", responseStr);
   }
}

//+------------------------------------------------------------------+
//| Manipulador de clique no botão de COMPRA                        |
//+------------------------------------------------------------------+
void OnBuyButtonClick()
{
   if(!EAEnabled)
   {
      Alert("❌ EA não está habilitado. Verifique a autorização da conta e validade da licença.");
      Print("❌ Tentativa de envio bloqueada. EA não habilitado.");
      return;
   }

   Print("📤 Enviando sinal BUY...");

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
   {
      BuySignalId = buyId;
      Comment("");
      Alert("✅ Sinal de COMPRA enviado com sucesso!\n\nEntry: ", DoubleToString(buyEntry, _Digits),
            "\nStop: ", DoubleToString(buyStopLoss, _Digits),
            "\nTake1: ", DoubleToString(buyTake1, _Digits));
      Print("✅ Sinal BUY enviado! ID: ", buyId, " | Monitorando entrada...");
   }
   else
   {
      BuySignalId = "";
      Alert("❌ Falha ao enviar sinal de COMPRA.\nVerifique sua conexão e tente novamente.");
      Print("❌ Falha ao enviar sinal BUY.");
   }
}

//+------------------------------------------------------------------+
//| Manipulador de clique no botão de VENDA                         |
//+------------------------------------------------------------------+
void OnSellButtonClick()
{
   if(!EAEnabled)
   {
      Alert("❌ EA não está habilitado. Verifique a autorização da conta e validade da licença.");
      Print("❌ Tentativa de envio bloqueada. EA não habilitado.");
      return;
   }

   Print("📤 Enviando sinal SELL...");

   // ========== ENVIAR SINAL SELL ==========
   double sellEntry = ObjectGetDouble(0, SellEntryLine, OBJPROP_PRICE);
   double sellStopLoss = ObjectGetDouble(0, SellStopLossLine, OBJPROP_PRICE);
   double sellTake1 = ObjectGetDouble(0, SellTake1Line, OBJPROP_PRICE);
   double sellTake2 = ObjectGetDouble(0, SellTake2Line, OBJPROP_PRICE);
   double sellTake3 = ObjectGetDouble(0, SellTake3Line, OBJPROP_PRICE);

   // Calcular stopTicks para SELL
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
   {
      SellSignalId = sellId;
      Comment("");
      Alert("✅ Sinal de VENDA enviado com sucesso!\n\nEntry: ", DoubleToString(sellEntry, _Digits),
            "\nStop: ", DoubleToString(sellStopLoss, _Digits),
            "\nTake1: ", DoubleToString(sellTake1, _Digits));
      Print("✅ Sinal SELL enviado! ID: ", sellId, " | Monitorando entrada...");
   }
   else
   {
      SellSignalId = "";
      Alert("❌ Falha ao enviar sinal de VENDA.\nVerifique sua conexão e tente novamente.");
      Print("❌ Falha ao enviar sinal SELL.");
   }
}

// Função OnSendButtonClick removida - substituída por OnBuyButtonClick e OnSellButtonClick

//+------------------------------------------------------------------+
//| Enviar sinal BUY quando preço atingir a linha                   |
//+------------------------------------------------------------------+
void SendBuySignal()
{
   if(!EAEnabled)
   {
      Print("❌ EA não está habilitado. Envio de sinal BUY bloqueado.");
      return;
   }
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
      // Limpar mensagem de erro do gráfico
      Comment("");
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
   if(!EAEnabled)
   {
      Print("❌ EA não está habilitado. Envio de sinal SELL bloqueado.");
      return;
   }
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
      // Limpar mensagem de erro do gráfico
      Comment("");
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
      // IMPORTANTE: Esta verificação só acontece UMA VEZ por sinal enviado
      // Uma vez que BuyEntryHit = true, nunca mais verifica a entrada BUY novamente
      // Mesmo que o preço volte a tocar a entrada, não atualiza mais o status
      // Para monitorar novamente, é necessário enviar um novo sinal
      // CRÍTICO: Só monitora se existe um sinal válido enviado (BuySignalId não vazio)
      if(BuySignalId != "" && !BuyEntryHit && buyEntry > 0)
      {
         // Entrada BUY é ativada quando ASK (preço de compra) atinge ou ultrapassa a linha
         if(ask >= buyEntry - PriceTolerance)
         {
            BuyEntryHit = true; // Marcar como atingido - NUNCA mais será verificado novamente neste sinal
            Print("✅ BUY Entry atingida! Preço: ", ask, " | Entry: ", buyEntry);
            Print("📌 EM_OPERACAO ativado para BUY. Entrada não será mais monitorada neste sinal.");
            // Atualizar status para EM_OPERACAO e enviar notificação (apenas uma vez)
            // VERIFICAÇÃO FINAL: Garantir que BuySignalId ainda é válido antes de atualizar
            if(BuySignalId != "")
               UpdateSignalStatus(BuySignalId, "EM_OPERACAO", ask);
            else
               Print("⚠️ AVISO: BuySignalId estava vazio ao tentar atualizar EM_OPERACAO!");
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
      // IMPORTANTE: Esta verificação só acontece UMA VEZ por sinal enviado
      // Uma vez que SellEntryHit = true, nunca mais verifica a entrada SELL novamente
      // Mesmo que o preço volte a tocar a entrada, não atualiza mais o status
      // Para monitorar novamente, é necessário enviar um novo sinal
      // CRÍTICO: Só monitora se existe um sinal válido enviado (SellSignalId não vazio)
      if(SellSignalId != "" && !SellEntryHit && sellEntry > 0)
      {
         // Entrada SELL é ativada quando BID (preço de venda) atinge ou ultrapassa a linha
         if(bid <= sellEntry + PriceTolerance)
         {
            SellEntryHit = true; // Marcar como atingido - NUNCA mais será verificado novamente neste sinal
            Print("✅ SELL Entry atingida! Preço: ", bid, " | Entry: ", sellEntry);
            Print("📌 EM_OPERACAO ativado para SELL. Entrada não será mais monitorada neste sinal.");
            // Atualizar status para EM_OPERACAO e enviar notificação (apenas uma vez)
            // VERIFICAÇÃO FINAL: Garantir que SellSignalId ainda é válido antes de atualizar
            if(SellSignalId != "")
               UpdateSignalStatus(SellSignalId, "EM_OPERACAO", bid);
            else
               Print("⚠️ AVISO: SellSignalId estava vazio ao tentar atualizar EM_OPERACAO!");
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
//| Atualizar sinal quando linhas são arrastadas                    |
//+------------------------------------------------------------------+
void UpdateSignalFromLines()
{
   if(!EAEnabled)
      return;

   // Atualizar sinal BUY se existir E ainda estiver ativo (não atingiu nenhum take ou stop)
   if(BuySignalId != "" && !BuyTake1Hit && !BuyTake2Hit && !BuyTake3Hit && !BuyStopHit)
   {
      double entry = ObjectGetDouble(0, BuyEntryLine, OBJPROP_PRICE);
      double stopLoss = ObjectGetDouble(0, BuyStopLossLine, OBJPROP_PRICE);
      double take1 = ObjectGetDouble(0, BuyTake1Line, OBJPROP_PRICE);
      double take2 = ObjectGetDouble(0, BuyTake2Line, OBJPROP_PRICE);
      double take3 = ObjectGetDouble(0, BuyTake3Line, OBJPROP_PRICE);

      if(entry > 0 && stopLoss > 0 && take1 > 0 && take2 > 0 && take3 > 0)
      {
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

         int stopTicks = (int)MathRound(MathAbs(entry - stopLoss) / tickSize);

         Print("📤 Enviando atualização do sinal BUY (ID: ", StringSubstr(BuySignalId, 0, 8), "...)");
         UpdateSignalData(BuySignalId, entry, stopLoss, take1, take2, take3, stopTicks);
      }
   }
   else if(BuySignalId != "")
   {
      if(BuyTake1Hit)
         Print("⚠️ Sinal BUY já atingiu Take 1. Não pode mais ser atualizado.");
      else if(BuyTake2Hit)
         Print("⚠️ Sinal BUY já atingiu Take 2. Não pode mais ser atualizado.");
      else if(BuyTake3Hit)
         Print("⚠️ Sinal BUY já atingiu Take 3. Não pode mais ser atualizado.");
      else if(BuyStopHit)
         Print("⚠️ Sinal BUY já atingiu Stop Loss. Não pode mais ser atualizado.");
   }

   // Atualizar sinal SELL se existir E ainda estiver ativo (não atingiu nenhum take ou stop)
   if(SellSignalId != "" && !SellTake1Hit && !SellTake2Hit && !SellTake3Hit && !SellStopHit)
   {
      double entry = ObjectGetDouble(0, SellEntryLine, OBJPROP_PRICE);
      double stopLoss = ObjectGetDouble(0, SellStopLossLine, OBJPROP_PRICE);
      double take1 = ObjectGetDouble(0, SellTake1Line, OBJPROP_PRICE);
      double take2 = ObjectGetDouble(0, SellTake2Line, OBJPROP_PRICE);
      double take3 = ObjectGetDouble(0, SellTake3Line, OBJPROP_PRICE);

      if(entry > 0 && stopLoss > 0 && take1 > 0 && take2 > 0 && take3 > 0)
      {
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

         int stopTicks = (int)MathRound(MathAbs(entry - stopLoss) / tickSize);

         Print("📤 Enviando atualização do sinal SELL (ID: ", StringSubstr(SellSignalId, 0, 8), "...)");
         UpdateSignalData(SellSignalId, entry, stopLoss, take1, take2, take3, stopTicks);
      }
   }
   else if(SellSignalId != "")
   {
      if(SellTake1Hit)
         Print("⚠️ Sinal SELL já atingiu Take 1. Não pode mais ser atualizado.");
      else if(SellTake2Hit)
         Print("⚠️ Sinal SELL já atingiu Take 2. Não pode mais ser atualizado.");
      else if(SellTake3Hit)
         Print("⚠️ Sinal SELL já atingiu Take 3. Não pode mais ser atualizado.");
      else if(SellStopHit)
         Print("⚠️ Sinal SELL já atingiu Stop Loss. Não pode mais ser atualizado.");
   }
}

//+------------------------------------------------------------------+
//| Atualizar dados do sinal na API                                  |
//+------------------------------------------------------------------+
void UpdateSignalData(string signalId, double entry, double stopLoss, 
                     double take1, double take2, double take3, int stopTicks)
{
   if(signalId == "")
   {
      Print("❌ Tentativa de atualizar sinal com ID vazio");
      return;
   }
   
   Print("📝 Atualizando sinal ", signalId, " com novos valores...");
   
   // Preparar URL do endpoint de atualização
   string updateUrl = EndpointURL;
   // Substituir "/signals" por "/signals/" + signalId
   int signalsPos = StringFind(updateUrl, "/signals");
   if(signalsPos != -1)
   {
      // Extrair base URL (até /api) e adicionar /signals/[id]
      int apiPos = StringFind(updateUrl, "/api");
      if(apiPos != -1)
      {
         updateUrl = StringSubstr(updateUrl, 0, apiPos) + "/api/signals/" + signalId;
      }
      else
      {
         updateUrl = "https://takepips.vercel.app/api/signals/" + signalId;
      }
   }
   else
   {
      updateUrl = "https://takepips.vercel.app/api/signals/" + signalId;
   }
   
   int digits = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);
   
   // Preparar JSON
   string json = "{"
                 + "\"entry\":" + DoubleToString(entry, digits) + ","
                 + "\"stopLoss\":" + DoubleToString(stopLoss, digits) + ","
                 + "\"take1\":" + DoubleToString(take1, digits) + ","
                 + "\"take2\":" + DoubleToString(take2, digits) + ","
                 + "\"take3\":" + DoubleToString(take3, digits) + ","
                 + "\"stopTicks\":" + IntegerToString(stopTicks)
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
   
   // Realizar requisição HTTP PATCH
   int timeout = 5000;
   ResetLastError();
   int res = WebRequest("PATCH", updateUrl, headers, timeout, post, result, result_headers);
   
   if(res == -1)
   {
      int error = GetLastError();
      Print("❌ Erro WebRequest ao atualizar sinal: ", error);
      Print("URL tentada: ", updateUrl);
      return;
   }
   
   string responseStr = CharArrayToString(result);
   if(res >= 200 && res < 300)
   {
      Print("✅ Sinal atualizado com sucesso!");
      Print("Resposta: ", responseStr);
   }
   else
   {
      Print("❌ Erro ao atualizar sinal. Código: ", res);
      Print("Resposta: ", responseStr);
   }
}

//+------------------------------------------------------------------+