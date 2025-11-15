//+------------------------------------------------------------------+
//|         MarlonAlphaGains EA 2.0  (Trading Automático)           |
//|                        by Marlon Brito                           |
//+------------------------------------------------------------------+
#property copyright "MarlonAlphaGains13/05/2025-CliqueAqui"
#property link      "https://chat.whatsapp.com/EYdrlQgIhkGKjazp8w4ZhM"
#property link      "wa.ma//5515981005698"
#property description "Todos Os Direitos Reservados - AlphaGains wa.ma//5515981005698 "
#property description "Chega de operar no escuro! Conheça o indicador que está revolucionando o mercado.Você já se sentiu perdido diante dos gráficos, sem saber se entra ou sai de uma operação, com medo de perder dinheiro por causa de uma decisão errada? Eu sei exatamente como é essa sensação…"
#property version   "2.0"
#property strict

//============================
// INPUTS DE TRADING AUTOMÁTICO
//============================
input group "Trading Automático"
input string EndpointURL = "https://takepips.vercel.app/api/signals";
input bool   AutoSendSignals = false;  // ⚠️ DESABILITADO: Use os botões BUY/SELL para enviar sinais manualmente
input bool   TestConnectionOnStart = false;
input bool   SendTestSignalOnStart = false;

//============================
// INPUTS DE LICENÇA (AlphaGains)
//============================
input string DataExpiracao   = "31.12.2025";  // Data limite (DD.MM.AAAA)
input long   ContaPermitida1 = 10184374;      // Conta autorizada 1
input long   ContaPermitida2 = 341015440;     // Conta autorizada 2
input long   ContaPermitida3 = 566595;        // Conta autorizada 3
input long   ContaPermitida4 = 25662995;      // Conta autorizada 4

//============================
// INPUTS DO SCALPER (MarlonBritoScalper)
//============================
enum ENUM_DISPLAY_MODE
{
    DISPLAY_TODAY,          // Apenas hoje
    DISPLAY_YESTERDAY,      // Apenas ontem
    DISPLAY_LAST_7_DAYS,    // Últimos 7 dias
    DISPLAY_LAST_30_DAYS,   // Últimos 30 dias
    DISPLAY_LAST_90_DAYS,   // Últimos 90 dias
    DISPLAY_LAST_180_DAYS   // Últimos 180 dias (6 meses)
};

input group "1. Configuração de Textos"
input int    fontSizeSessao      = 10;
input int    fontSizeZN          = 8;
input int    fontSizeTake        = 8;
input int    fontSizePreco       = 8;
input string fontFamily          = "Arial";
input color  CorTextoSessao      = clrWhite;
input color  CorTextoZN          = clrDodgerBlue;
input color  CorTextoTake        = clrLime;
input color  CorTextoPreco       = clrYellow;
input int    TextVerticalOffsetPips = 5;

input group "2. Cores das Linhas"
input color corZN_Up            = clrDodgerBlue;
input color corZN_Down          = clrDodgerBlue;
input color corTake1            = clrLime;
input color corTake2            = clrGreen;
input color corTake3            = clrForestGreen;
input color corTake4            = clrDarkGreen;
input color corTake5            = clrOlive;
input color corTake6            = clrDarkSlateGray;
input color corTake7            = clrDimGray;
input color corTake8            = clrGray;
input color corTake9            = clrLightGray;
input color corTake10           = clrWhiteSmoke;

input group "3. Estilos das Linhas"
input ENUM_LINE_STYLE estiloLinhaCR = STYLE_DASHDOT;
input ENUM_LINE_STYLE estiloLinhaZN = STYLE_DOT;
input ENUM_LINE_STYLE estiloLinhaTake = STYLE_SOLID;
input int    espessuraCR                 = 2;
input int    espessuraZN                 = 2;
input int    espessuraTake               = 1;

input group "4. Configurações Gerais"
input double percentualEncurtamento=95.0;
input int    mesesParaTras             = 6;  // Limite global de histórico
input int    pontosMinimosCR           = 100; // Mínimo de pontos para formar o canal
input bool   mostrarPrecoFinalLinha=false;
input bool   mostrarAreaCR             = true;
input color  corAreaCR                 = clrDarkSlateGray;
input int    opacidadeAreaCR           = 50;
input bool   useWicksForCR             = true;

input group "5. Configurações de Alarme para Zonas Neutras"
input bool   EnableAlerts            = true;
input bool   PopupAlert              = true;
input bool   PushNotification        = false;
input bool   EmailAlert              = false;
input bool   PlaySoundAlert          = true;
input string SoundFile               = "alert.wav";

input group "6. Modo de Exibição (Performance)"
input ENUM_DISPLAY_MODE modoExibicao = DISPLAY_TODAY;

input group "Sessão 1"
input bool   enableSession1          = true;
input string sessionName1            = "CANDLE H4 - 19H";
input string sessionTime1            = "01:05";
input int    minSessionBars1         = 1;
input int    maxSessionBars1         = 4;
input color  sessionTopoColor1       = clrDarkGreen;
input color  sessionFundoColor1      = clrGreen;
input string InpNomeZNUp_Ses1        = "ZN (Compra) 19H";
input string InpNomeZNDown_Ses1      = "ZN (Venda) 19H";

// Prefixos e constantes
#define INDICATOR_PREFIX "PPIPS_"
#define PREFIX_SES1 "SES1_"


//============================
// ESTRUTURAS
//============================
struct SessionData
{
    bool enable;
    string name;
    string timeStr;
    int minBars;
    int maxBars;
    color topoColor;
    color fundoColor;
    string prefix;
    int hour;
    int minute;
    datetime startTime;
    string znNameUp;
    string znNameDown;
    double znUpPrice;
    double znDownPrice;
    bool active;
};

struct ActiveZN
{
    string sessionName;
    string sessionPrefix;
    string znNameUp;
    string znNameDown;
    double crTopPrice;
    double crBottomPrice;
    double znUpPrice;
    double znDownPrice;
    datetime startTime;
    datetime endTime;
    bool signalSent;
    bool manualBuySignalSent;
    bool manualSellSignalSent;
    datetime firstManualSignalTime;
    string firstManualSignalType;
};

struct SignalData
{
    string id;
    string tipo;
    double preco_entrada;
    double stop_loss;
    double take_profit[10];
    datetime timestamp;
    bool active;
    string sessionName;
    string status; // PENDING, EM_OPERACAO, etc
    double znTriggerPrice; // Preço da ZN que aciona o sinal
    string sessionPrefix; // Prefixo da sessão para deletar objetos
    long diaUnicoID; // ID único do dia para identificar linhas
};

//============================
// VARIÁVEIS GLOBAIS
//============================
int lastCalculatedBar = 0;
bool AlertTriggered[];
ActiveZN activeZNs[100];
int activeZNCount = 0;
string currentActiveSession = "";
datetime lastProcessedDay = 0;
ENUM_DISPLAY_MODE lastModoExibicao = DISPLAY_TODAY;

bool licenseValid = false;
SignalData currentBuySignal, currentSellSignal;
bool hasBuySignal = false, hasSellSignal = false;
datetime lastBarTime = 0;

//============================
// DECLARAÇÃO DE FUNÇÕES
//============================
void DeleteObjectsByPrefix(string prefix);
void CriarLinhaPersonalizada(string nome, datetime t1, double p1, datetime t2, double p2, color cor, ENUM_LINE_STYLE estilo, int espessura, bool raio=false);
void AdicionarTextoPersonalizado(string nome, datetime tempo, double preco, string texto, color cor, int fontSize, int anchor);
void DesenharAreaCR(datetime start, datetime end, double top, double bottom, string prefixo, long id);
datetime GetDisplayLimitTime(ENUM_DISPLAY_MODE mode, int maxMonthsBack=6);
bool ParseHHMM(const string timeStr, int &hour, int &minute);
datetime FindNextSessionTime(datetime currentTime, SessionData &sessions[], int currentIndex);
datetime GetSessionStartTime(datetime day, int hour, int minute);
string GetActiveSessionName(datetime currentTime, SessionData &sessions[]);
color GetTakeColor(int index);
void MarcarSessao(const int rates_total,
                  const int prev_calculated,
                  const datetime &time[],
                  const double &open[],
                  const double &high[],
                  const double &low[],
                  const double &close[],
                  const int startIndex,
                  const int min_session_bars,
                  const int max_session_bars,
                  string prefixoObjeto,
                  string sessionLabelText,
                  color corTopo,
                  color corFundo,
                  bool use_wicks_for_cr,
                  string znNameUp,
                  string znNameDown,
                  datetime final_time_for_lines);

bool SendSignalToEndpoint(SignalData &signal);
void SendTestSignal();
void SendManualBuySignal();
void SendManualSellSignal();
void CheckPendingSignalActivation();
void MonitorPriceLevels();
bool UpdateSignalStatus(string signalId, string status, double preco_saida);
bool UpdateSignalEntry(string signalId, double newEntry);
void EncerrarSinal(string signalId);
void CreateButtons();
void CheckZNBreakout();
void UpdateSignalFromZNMovement();

//============================
// OnInit
//============================
int OnInit()
{
   datetime expire = StringToTime("31.12.2025");
   if(TimeCurrent() > expire)
   {
      Alert("⚠️ Licença expirada em ", DataExpiracao, ". Contate suporte: wa.me//5515981005698");
      Print("⚠️ Licença expirada em ", DataExpiracao);
      return(INIT_FAILED);
   }

   long contaAtual = AccountInfoInteger(ACCOUNT_LOGIN);
   if (contaAtual != ContaPermitida1 && contaAtual != ContaPermitida2 && contaAtual != ContaPermitida3 && contaAtual != ContaPermitida4)
   {
      Alert("🚫 Conta não autorizada: ", contaAtual, ". Contate suporte: wa.me//5515981005698 .");
      Print("🚫 Conta não autorizada: ", contaAtual);
      return(INIT_FAILED);
   }

   licenseValid = true;
   Print("✅ Licença validada para conta ", contaAtual, " até ", DataExpiracao);

   ArrayInitialize(AlertTriggered, false);
   activeZNCount = 0;
   for(int i = 0; i < 100; i++)
   {
      activeZNs[i] = ActiveZN();
      activeZNs[i].signalSent = false;
      activeZNs[i].manualBuySignalSent = false;
      activeZNs[i].manualSellSignalSent = false;
      activeZNs[i].firstManualSignalTime = 0;
      activeZNs[i].firstManualSignalType = "";
   }

   hasBuySignal = false;
   hasSellSignal = false;
   CreateButtons();

   if(TestConnectionOnStart)
   {
      Print("🔍 Testando conexão com endpoint...");
   }

   if(SendTestSignalOnStart)
   {
      Print("🧪 Enviando sinal de TESTE...");
      SendTestSignal();
   }

   Print("🟢 AlphaGains EA (Trading Automático) carregado. Modo: ", EnumToString(modoExibicao));
   return(INIT_SUCCEEDED);
}

//============================
// OnDeinit
//============================
void OnDeinit(const int reason)
{
    DeleteObjectsByPrefix(INDICATOR_PREFIX);
    ObjectDelete(0, "BtnBuy");
    ObjectDelete(0, "BtnSell");
    ObjectDelete(0, "BtnReset");
    ObjectDelete(0, "BtnUpdate");
    Print("🔴 EA desativado.");
}

//============================
// OnTick
//============================
void OnTick()
{
    if(!licenseValid) return;

    MqlRates rates[];
    ArraySetAsSeries(rates, true);
    int copied = CopyRates(_Symbol, _Period, 0, 100, rates);
    if(copied < 5) return;

    datetime time[];
    double open[], high[], low[], close[];

    ArraySetAsSeries(time, true);
    ArraySetAsSeries(open, true);
    ArraySetAsSeries(high, true);
    ArraySetAsSeries(low, true);
    ArraySetAsSeries(close, true);

    int rates_total = copied;
    CopyTime(_Symbol, _Period, 0, rates_total, time);
    CopyOpen(_Symbol, _Period, 0, rates_total, open);
    CopyHigh(_Symbol, _Period, 0, rates_total, high);
    CopyLow(_Symbol, _Period, 0, rates_total, low);
    CopyClose(_Symbol, _Period, 0, rates_total, close);

    if(rates_total > ArraySize(AlertTriggered))
    {
        ArrayResize(AlertTriggered, rates_total);
        for(int i = ArraySize(AlertTriggered) - rates_total; i < rates_total; i++)
            AlertTriggered[i] = false;
    }

    datetime todayStart = iTime(_Symbol, PERIOD_D1, 0);
    if(todayStart != lastProcessedDay || lastModoExibicao != modoExibicao)
    {
        DeleteObjectsByPrefix(INDICATOR_PREFIX);
        activeZNCount = 0;
        lastProcessedDay = todayStart;
        lastModoExibicao = modoExibicao;
        string modoStr = "";
        switch(modoExibicao)
        {
            case DISPLAY_TODAY: modoStr = "HOJE"; break;
            case DISPLAY_YESTERDAY: modoStr = "ONTEM"; break;
            case DISPLAY_LAST_7_DAYS: modoStr = "ÚLTIMOS 7 DIAS"; break;
            case DISPLAY_LAST_30_DAYS: modoStr = "ÚLTIMOS 30 DIAS"; break;
            case DISPLAY_LAST_90_DAYS: modoStr = "ÚLTIMOS 90 DIAS"; break;
            case DISPLAY_LAST_180_DAYS: modoStr = "ÚLTIMOS 180 DIAS (6 MESES)"; break;
        }
        Print("🗑️  Limpeza disparada. Novo modo: ", modoStr, " | Dia: ", TimeToString(todayStart, TIME_DATE));
    }

    SessionData sessions[1];
    sessions[0].enable = enableSession1; sessions[0].name = sessionName1; sessions[0].timeStr = sessionTime1;
    sessions[0].minBars = minSessionBars1; sessions[0].maxBars = maxSessionBars1; sessions[0].topoColor = sessionTopoColor1; sessions[0].fundoColor = sessionFundoColor1;
    sessions[0].prefix = PREFIX_SES1; sessions[0].znNameUp = InpNomeZNUp_Ses1; sessions[0].znNameDown = InpNomeZNDown_Ses1;

    // Valida apenas a Sessão 1
    if(sessions[0].enable)
    {
        if(!ParseHHMM(sessions[0].timeStr, sessions[0].hour, sessions[0].minute))
        {
            Print("🔴 Erro: Formato de horário inválido para a Sessão ", sessions[0].name, ". Use HH:MM");
            return;
        }
    }

    datetime currentTime = time[0];

    for(int z = activeZNCount-1; z >= 0; z--)
    {
        if(activeZNs[z].endTime > 0 && currentTime >= activeZNs[z].endTime)
        {
            DeleteObjectsByPrefix(activeZNs[z].sessionPrefix);
            Print("🟡 ZN expirada: ", activeZNs[z].sessionName, " (", activeZNs[z].znNameUp, " / ", activeZNs[z].znNameDown, ")");
            for(int k = z; k < activeZNCount - 1; k++) activeZNs[k] = activeZNs[k+1];
            activeZNCount--;
        }
    }

    for(int i = rates_total - 1; i >= 0; i--)
    {
        for(int j = 0; j < 1; j++)
        {
            if(!sessions[j].enable) continue;
            MqlDateTime tm_bar; TimeToStruct(time[i], tm_bar);
            if(tm_bar.hour == sessions[j].hour && tm_bar.min == sessions[j].minute)
            {
                datetime displayLimit = GetDisplayLimitTime(modoExibicao, mesesParaTras);
                if(time[i] < displayLimit) continue;

                bool alreadyExists = false;
                for(int z = 0; z < activeZNCount; z++)
                    if(activeZNs[z].startTime == time[i]) { alreadyExists = true; break; }
                if(alreadyExists) continue;

                datetime next_session_start = FindNextSessionTime(time[i], sessions, j);

                double topo = -DBL_MAX; double fundo = DBL_MAX;
                int actual_session_bars = 0;

                Print("🔍 DEBUG: Iniciando análise de sessão ", sessions[j].name, " em i=", i, " | maxBars=", sessions[j].maxBars, " | minBars=", sessions[j].minBars);

                for(int k = 0; k < sessions[j].maxBars && (i - k) >= 0; k++)
                {
                    if(useWicksForCR)
                    {
                        if(high[i-k] > topo) topo = high[i-k];
                        if(low[i-k] < fundo) fundo = low[i-k];
                    }
                    else
                    {
                        double max_candle = MathMax(open[i-k], close[i-k]);
                        double min_candle = MathMin(open[i-k], close[i-k]);
                        if(max_candle > topo) topo = max_candle;
                        if(min_candle < fundo) fundo = min_candle;
                    }

                    int pontos = (int)((topo - fundo) / _Point);
                    Print("  📊 k=", k, " | i-k=", i-k, " | Topo=", topo, " | Fundo=", fundo, " | Pontos=", pontos, " | Min=", pontosMinimosCR);

                    if( (topo - fundo) / _Point >= pontosMinimosCR && (k+1) >= sessions[j].minBars )
                    {
                        actual_session_bars = k + 1;
                        Print("  ✅ Condição atingida em k=", k, " | actual_session_bars=", actual_session_bars);
                        break;
                    }
                    if( (k+1) == sessions[j].maxBars )
                    {
                        actual_session_bars = k + 1;
                        Print("  ⚠️ Atingiu maxBars sem critério | actual_session_bars=", actual_session_bars);
                    }
                }

                if(topo > fundo && (topo - fundo) / _Point >= pontosMinimosCR && activeZNCount < 99)
                {
                    double rangeHeight = topo - fundo;
                    double znUpPrice = topo + rangeHeight;
                    double znDownPrice = fundo - rangeHeight;

                    activeZNs[activeZNCount].sessionName = sessions[j].name;
                    activeZNs[activeZNCount].sessionPrefix = sessions[j].prefix;
                    activeZNs[activeZNCount].crTopPrice = topo;
                    activeZNs[activeZNCount].crBottomPrice = fundo;
                    activeZNs[activeZNCount].znNameUp = sessions[j].znNameUp;
                    activeZNs[activeZNCount].znNameDown = sessions[j].znNameDown;
                    activeZNs[activeZNCount].znUpPrice = znUpPrice;
                    activeZNs[activeZNCount].znDownPrice = znDownPrice;
                    activeZNs[activeZNCount].startTime = time[i];
                    activeZNs[activeZNCount].endTime = next_session_start;
                    activeZNs[activeZNCount].signalSent = false;
                    activeZNCount++;

                    Print("🟢 Nova ZN criada: ", sessions[j].name, " | Canal formado em ", actual_session_bars, " velas (índice i=", i, ") | Válida até: ", TimeToString(next_session_start));
                }
                else if (topo > fundo)
                {
                    Print("🟡 Canal ignorado: ", sessions[j].name, " | Amplitude (", (topo - fundo) / _Point, " pontos) é menor que o mínimo (", pontosMinimosCR, " pontos)");
                }
            }
        }
    }

    for(int z = 0; z < activeZNCount; z++)
    {
        datetime displayLimit = GetDisplayLimitTime(modoExibicao, mesesParaTras);
        if(activeZNs[z].startTime < displayLimit) continue;

        int session_start_index = -1;
        for(int idx = 0; idx < rates_total; idx++)
            if(time[idx] == activeZNs[z].startTime) { session_start_index = idx; break; }
        if(session_start_index < 0) continue;

        datetime final_time_for_lines = activeZNs[z].endTime;
        if(final_time_for_lines == 0) continue;

        for(int j=0; j<8; j++)
        {
            if(sessions[j].name == activeZNs[z].sessionName)
            {
                MarcarSessao(rates_total, 0, time, open, high, low, close,
                             session_start_index, sessions[j].minBars, sessions[j].maxBars,
                             activeZNs[z].sessionPrefix, activeZNs[z].sessionName,
                             sessions[j].topoColor, sessions[j].fundoColor, useWicksForCR,
                             activeZNs[z].znNameUp, activeZNs[z].znNameDown, final_time_for_lines);
                break;
            }
        }
    }

    int currentBar = 0;
    if(EnableAlerts)
    {
        currentActiveSession = GetActiveSessionName(currentTime, sessions);
        for(int z = 0; z < activeZNCount; z++)
        {
            if(activeZNs[z].endTime > 0 && currentTime >= activeZNs[z].endTime) continue;
            if(activeZNs[z].sessionName != currentActiveSession) continue;

            double tolerance = _Point * 20;
            bool triggeredUp = false;
            bool triggeredDown = false;

            if(high[currentBar] >= activeZNs[z].znUpPrice - tolerance &&
               low[currentBar] <= activeZNs[z].znUpPrice + tolerance) triggeredUp = true;
            if(low[currentBar] <= activeZNs[z].znDownPrice + tolerance &&
               high[currentBar] >= activeZNs[z].znDownPrice - tolerance) triggeredDown = true;

            if((triggeredUp || triggeredDown) && !AlertTriggered[currentBar])
            {
                string message = "🔔 ALERTE ZN: ";
                if(triggeredUp) message += activeZNs[z].znNameUp + " tocada na sessão " + activeZNs[z].sessionName;
                if(triggeredDown) message += activeZNs[z].znNameDown + " tocada na sessão " + activeZNs[z].sessionName;

                if(PopupAlert) Alert(message);
                if(PushNotification) SendNotification(message);
                if(EmailAlert) SendMail("Alerta ZN", message);
                if(PlaySoundAlert) PlaySound(SoundFile);

                Print("🔔 ALERTA: ", message);
                AlertTriggered[currentBar] = true;
            }
        }
    }

    // Detectar novo candle
    bool newBar = (time[0] != lastBarTime);
    if(newBar)
    {
        lastBarTime = time[0];

        // AutoSendSignals: envio automático de sinais ao romper ZN
        if(AutoSendSignals)
        {
            CheckZNBreakout();
        }

        // Verifica se há sinais PENDING que devem ser acionados
        if(hasBuySignal || hasSellSignal)
        {
            CheckPendingSignalActivation();
        }
    }

    // Monitora stop/take de sinais que já estão EM_OPERACAO (tick a tick)
    if(hasBuySignal || hasSellSignal)
    {
        MonitorPriceLevels();
    }

    ChartRedraw();
}

//============================
// FUNÇÕES AUXILIARES (do indicador)
//============================
void DeleteObjectsByPrefix(string prefix)
{
    int total = ObjectsTotal(0, 0, -1);
    for(int i = total-1; i >= 0; i--)
    {
        string name = ObjectName(0, i, 0, -1);
        if(StringFind(name, prefix) == 0) ObjectDelete(0, name);
    }
}

void CriarLinhaPersonalizada(string nome, datetime t1, double p1, datetime t2, double p2, color cor, ENUM_LINE_STYLE estilo, int espessura, bool raio=false)
{
    string fullName = INDICATOR_PREFIX + nome;
    bool isZNLine = (StringFind(nome, "REPL_UP") >= 0 || StringFind(nome, "REPL_DOWN") >= 0);
    
    // Verificar se o objeto já existe
    bool objectExists = (ObjectFind(0, fullName) >= 0);
    
    // Linhas ZN usam OBJ_HLINE (horizontal) para facilitar o movimento
    // Outras linhas usam OBJ_TREND
    if(!objectExists)
    {
        if(isZNLine)
        {
            // Criar linha horizontal (mais fácil de arrastar)
            if(!ObjectCreate(0, fullName, OBJ_HLINE, 0, 0, p1))
            {
                Print("🔴 Falha ao criar ZN ", fullName, ": ", GetLastError());
                return;
            }
            Print("✏️ Linha ZN criada como EDITÁVEL: ", fullName, " @ ", p1);
        }
        else
        {
            // Criar linha de tendência normal
            if(!ObjectCreate(0, fullName, OBJ_TREND, 0, t1, p1, t2, p2))
            {
                Print("🔴 Falha ao criar objeto ", fullName, ": ", GetLastError());
                return;
            }
        }
        
        // Configurar propriedades APENAS na criação (não repetir a cada tick)
        ObjectSetInteger(0, fullName, OBJPROP_COLOR, cor);
        ObjectSetInteger(0, fullName, OBJPROP_STYLE, estilo);
        ObjectSetInteger(0, fullName, OBJPROP_WIDTH, espessura);
        
        // Linhas ZN são SELECIONÁVEIS e EDITÁVEIS para ajuste manual
        if(isZNLine)
        {
            ObjectSetInteger(0, fullName, OBJPROP_SELECTABLE, true);
            ObjectSetInteger(0, fullName, OBJPROP_BACK, false); // Frente para facilitar seleção
            ObjectSetInteger(0, fullName, OBJPROP_ZORDER, 0); // Prioridade de seleção
        }
        else
        {
            ObjectSetInteger(0, fullName, OBJPROP_SELECTABLE, false);
            ObjectSetInteger(0, fullName, OBJPROP_BACK, false);
            ObjectSetInteger(0, fullName, OBJPROP_RAY, raio);
        }
    }
    // Se o objeto já existe, não fazer nada (deixar o usuário mover se quiser)
}

void AdicionarTextoPersonalizado(string nome, datetime tempo, double preco, string texto, color cor, int fontSize, int anchor)
{
    string fullName = INDICATOR_PREFIX + nome;
    bool isZNLabel = (StringFind(nome, "LABEL_UP") >= 0 || StringFind(nome, "LABEL_DOWN") >= 0);
    
    // Labels de ZN precisam atualizar a posição quando a linha é movida
    if(isZNLabel && ObjectFind(0, fullName) >= 0)
    {
        // Se é label de ZN e já existe, atualizar a posição baseada na linha
        string lineName = "";
        if(StringFind(nome, "LABEL_UP") >= 0)
        {
            StringReplace(nome, "LABEL_UP", "REPL_UP");
            lineName = INDICATOR_PREFIX + nome;
        }
        else if(StringFind(nome, "LABEL_DOWN") >= 0)
        {
            StringReplace(nome, "LABEL_DOWN", "REPL_DOWN");
            lineName = INDICATOR_PREFIX + nome;
        }
        
        // Ler preço atual da linha ZN
        if(ObjectFind(0, lineName) >= 0)
        {
            double linePrice = ObjectGetDouble(0, lineName, OBJPROP_PRICE, 0);
            double offset = TextVerticalOffsetPips * _Point;
            
            // Ajustar posição do label baseado na linha
            if(StringFind(nome, "UP") >= 0)
                ObjectSetDouble(0, fullName, OBJPROP_PRICE, 0, linePrice + offset);
            else
                ObjectSetDouble(0, fullName, OBJPROP_PRICE, 0, linePrice - offset);
            
            return; // Não recriar
        }
    }
    
    if(ObjectFind(0, fullName) < 0)
    {
        if(!ObjectCreate(0, fullName, OBJ_TEXT, 0, tempo, preco))
        {
            Print("🔴 Falha ao criar texto ", fullName, ": ", GetLastError());
            return;
        }
    }
    ObjectSetString(0, fullName, OBJPROP_TEXT, texto);
    ObjectSetString(0, fullName, OBJPROP_FONT, fontFamily);
    ObjectSetInteger(0, fullName, OBJPROP_COLOR, cor);
    ObjectSetInteger(0, fullName, OBJPROP_FONTSIZE, fontSize);
    ObjectSetInteger(0, fullName, OBJPROP_ANCHOR, anchor);
    ObjectSetInteger(0, fullName, OBJPROP_BACK, false);
    ObjectSetInteger(0, fullName, OBJPROP_SELECTABLE, false);
}

void DesenharAreaCR(datetime start, datetime end, double top, double bottom, string prefixo, long id)
{
    if(!mostrarAreaCR) return;
    string name = INDICATOR_PREFIX + prefixo + "AREA" + IntegerToString((int)id);
    if(ObjectFind(0, name) < 0)
    {
        if(!ObjectCreate(0, name, OBJ_RECTANGLE, 0, start, top, end, bottom))
        {
            Print("🔴 Falha ao criar área CR ", name, ": ", GetLastError());
            return;
        }
    }
    ObjectSetInteger(0, name, OBJPROP_BACK, true);
    ObjectSetInteger(0, name, OBJPROP_FILL, true);
    ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
    ObjectSetInteger(0, name, OBJPROP_WIDTH, 1);
    ObjectSetInteger(0, name, OBJPROP_STYLE, STYLE_SOLID);

    uchar red    = (uchar)(corAreaCR & 0xFF);
    uchar green  = (uchar)((corAreaCR >> 8) & 0xFF);
    uchar blue   = (uchar)((corAreaCR >> 16) & 0xFF);
    uchar alpha  = (uchar)MathRound(2.55 * opacidadeAreaCR);
    color finalColor = (alpha << 24) | (blue << 16) | (green << 8) | red;
    ObjectSetInteger(0, name, OBJPROP_COLOR, finalColor);
}

datetime GetDisplayLimitTime(ENUM_DISPLAY_MODE mode, int maxMonthsBack=6)
{
    datetime now = TimeCurrent();
    datetime limit = 0;
    switch(mode)
    {
        case DISPLAY_TODAY:
            {
                MqlDateTime t; TimeToStruct(now, t); t.hour=0; t.min=0; t.sec=0; limit = StructToTime(t);
            } break;
        case DISPLAY_YESTERDAY:
            {
                MqlDateTime t; TimeToStruct(now - 86400, t); t.hour=0; t.min=0; t.sec=0; limit = StructToTime(t);
            } break;
        case DISPLAY_LAST_7_DAYS: limit = now - (7 * 86400); break;
        case DISPLAY_LAST_30_DAYS: limit = now - (30 * 86400); break;
        case DISPLAY_LAST_90_DAYS: limit = now - (90 * 86400); break;
        case DISPLAY_LAST_180_DAYS: limit = now - (180 * 86400); break;
    }
    datetime globalLimit = now - (maxMonthsBack * 30 * 86400);
    if(limit < globalLimit) limit = globalLimit;
    return limit;
}

bool ParseHHMM(const string timeStr, int &hour, int &minute)
{
    string parts[];
    int count = StringSplit(timeStr, ':', parts);
    if(count != 2) return false;
    hour = (int)StringToInteger(parts[0]);
    minute = (int)StringToInteger(parts[1]);
    return (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59);
}

datetime FindNextSessionTime(datetime currentTime, SessionData &sessions[], int currentIndex)
{
    datetime nextTime = 0;
    int sessionsCount = ArraySize(sessions);

    for(int i = 0; i < sessionsCount; i++)
    {
        if(sessions[i].enable)
        {
            datetime sessionStart = GetSessionStartTime(currentTime, sessions[i].hour, sessions[i].minute);
            if(sessionStart > currentTime)
            {
                if(nextTime == 0 || sessionStart < nextTime) nextTime = sessionStart;
            }
        }
    }
    if(nextTime == 0)
    {
        datetime tomorrow = currentTime + 86400;
        for(int i = 0; i < sessionsCount; i++)
        {
            if(sessions[i].enable)
            {
                datetime sessionStart = GetSessionStartTime(tomorrow, sessions[i].hour, sessions[i].minute);
                if(nextTime == 0 || sessionStart < nextTime) nextTime = sessionStart;
            }
        }
    }
    if(nextTime == 0)
    {
        MqlDateTime tm; TimeToStruct(currentTime, tm); tm.hour=23; tm.min=59; tm.sec=59; nextTime = StructToTime(tm);
    }
    return nextTime;
}

datetime GetSessionStartTime(datetime day, int hour, int minute)
{
    MqlDateTime tm; TimeToStruct(day, tm); tm.hour = hour; tm.min = minute; tm.sec = 0; return StructToTime(tm);
}

string GetActiveSessionName(datetime currentTime, SessionData &sessions[])
{
    string activeName = ""; datetime activeStart = 0;
    int sessionsCount = ArraySize(sessions);

    for(int i = 0; i < sessionsCount; i++)
    {
        if(sessions[i].enable)
        {
            datetime sessionStart = GetSessionStartTime(currentTime, sessions[i].hour, sessions[i].minute);
            datetime sessionEnd = sessionStart + (sessions[i].maxBars * PeriodSeconds(_Period));
            if(currentTime >= sessionStart && currentTime < sessionEnd)
            {
                if(activeName == "" || sessionStart > activeStart)
                {
                    activeName = sessions[i].name;
                    activeStart = sessionStart;
                }
            }
        }
    }
    return activeName;
}

color GetTakeColor(int index)
{
    switch(index)
    {
        case 1: return corTake1;
        case 2: return corTake2;
        case 3: return corTake3;
        case 4: return corTake4;
        case 5: return corTake5;
        case 6: return corTake6;
        case 7: return corTake7;
        case 8: return corTake8;
        case 9: return corTake9;
        case 10: return corTake10;
        default: return clrWhite;
    }
}

void MarcarSessao(const int rates_total,
                  const int prev_calculated,
                  const datetime &time[],
                  const double &open[],
                  const double &high[],
                  const double &low[],
                  const double &close[],
                  const int startIndex,
                  const int min_session_bars,
                  const int max_session_bars,
                  string prefixoObjeto,
                  string sessionLabelText,
                  color corTopo,
                  color corFundo,
                  bool use_wicks_for_cr,
                  string znNameUp,
                  string znNameDown,
                  datetime final_time_for_lines)
{
    double topo = -DBL_MAX; double fundo = DBL_MAX;
    int inicio = startIndex;
    int actual_bars_used = max_session_bars;

    for(int i = 0; i < max_session_bars; i++)
    {
        if((inicio - i) < 0) { actual_bars_used = i; break; }
        if(use_wicks_for_cr)
        {
            if(high[inicio-i] > topo) topo = high[inicio-i];
            if(low[inicio-i] < fundo) fundo = low[inicio-i];
        }
        else
        {
            double max_candle = MathMax(open[inicio-i], close[inicio-i]);
            double min_candle = MathMin(open[inicio-i], close[inicio-i]);
            if(max_candle > topo) topo = max_candle;
            if(min_candle < fundo) fundo = min_candle;
        }

        if((i+1) >= min_session_bars && (topo - fundo) / _Point >= pontosMinimosCR)
        {
            actual_bars_used = i + 1;
            break;
        }
    }

    double rangeHeight = topo - fundo;
    int pontosCR = (int)MathRound(rangeHeight / _Point);
    if(pontosCR < pontosMinimosCR) return;

    datetime t1_lines = time[inicio];
    MqlDateTime tm_end_of_day; TimeToStruct(t1_lines, tm_end_of_day);
    tm_end_of_day.hour=23; tm_end_of_day.min=59; tm_end_of_day.sec=59;
    datetime end_of_day = StructToTime(tm_end_of_day);
    datetime final_time_capped = MathMin(final_time_for_lines, end_of_day);
    double vOffset = TextVerticalOffsetPips * _Point;

    MqlDateTime tm_inicio; TimeToStruct(time[inicio], tm_inicio);
    long diaUnicoID = (long)tm_inicio.year*10000000000 + (long)tm_inicio.mon*100000000 +
                      (long)tm_inicio.day*1000000 + (long)tm_inicio.hour*10000 +
                      (long)tm_inicio.min*100 + (long)tm_inicio.sec;
    int pontosZN = pontosCR * 2;

    CriarLinhaPersonalizada(prefixoObjeto + "CR_TOPO" + IntegerToString((int)diaUnicoID),
                           t1_lines, topo, final_time_capped, topo, corTopo, estiloLinhaCR, espessuraCR);
    CriarLinhaPersonalizada(prefixoObjeto + "CR_FUNDO" + IntegerToString((int)diaUnicoID),
                           t1_lines, fundo, final_time_capped, fundo, corFundo, estiloLinhaCR, espessuraCR);

    if(mostrarAreaCR) DesenharAreaCR(t1_lines, final_time_capped, topo, fundo, prefixoObjeto, diaUnicoID);

    datetime label_time = time[MathMin(inicio + 20, rates_total - 1)];
    if(label_time > final_time_capped) label_time = final_time_capped;

    AdicionarTextoPersonalizado(prefixoObjeto + "LABEL_CR" + IntegerToString((int)diaUnicoID),
                                label_time, (topo+fundo)/2,
                                sessionLabelText + " (" + IntegerToString(actual_bars_used) +
                                " velas) (CR: " + IntegerToString(pontosCR) + " pips)",
                                CorTextoSessao, fontSizeSessao, ANCHOR_CENTER);

    double znUpPrice = topo + rangeHeight;
    string nomeZNUp = prefixoObjeto + "REPL_UP_1" + IntegerToString((int)diaUnicoID);
    string labelZNUp = prefixoObjeto + "LABEL_UP_1" + IntegerToString((int)diaUnicoID);

    CriarLinhaPersonalizada(nomeZNUp, t1_lines, znUpPrice, final_time_capped, znUpPrice,
                           corZN_Up, estiloLinhaZN, espessuraZN);
    AdicionarTextoPersonalizado(labelZNUp, label_time, znUpPrice + vOffset,
                                znNameUp + ": (" + IntegerToString(pontosZN) + " pontos) (" +
                                DoubleToString(znUpPrice, _Digits) + ")",
                                CorTextoZN, fontSizeZN, ANCHOR_LEFT);

    double znDownPrice = fundo - rangeHeight;
    string nomeZNDown = prefixoObjeto + "REPL_DOWN_1" + IntegerToString((int)diaUnicoID);
    string labelZNDown = prefixoObjeto + "LABEL_DOWN_1" + IntegerToString((int)diaUnicoID);

    CriarLinhaPersonalizada(nomeZNDown, t1_lines, znDownPrice, final_time_capped, znDownPrice,
                           corZN_Down, estiloLinhaZN, espessuraZN);
    AdicionarTextoPersonalizado(labelZNDown, label_time, znDownPrice - vOffset,
                                znNameDown + ": (" + IntegerToString(pontosZN) + " pontos) (" +
                                DoubleToString(znDownPrice, _Digits) + ")",
                                CorTextoZN, fontSizeZN, ANCHOR_LEFT);

    double takeDistance = rangeHeight + rangeHeight;
    for(int i = 1; i <= 10; i++)
    {
        double takeUpPrice = znUpPrice + (takeDistance * i);
        string takeUpName = prefixoObjeto + "TP_COMPRA" + IntegerToString(i) + "_" + IntegerToString((int)diaUnicoID);
        string takeUpLabel = prefixoObjeto + "LABEL_COMPRA" + IntegerToString(i) + "_" + IntegerToString((int)diaUnicoID);
        string takeTextUp = "TP (Compra) " + IntegerToString(i);
        color corLinha = GetTakeColor(i);

        CriarLinhaPersonalizada(takeUpName, t1_lines, takeUpPrice, final_time_capped, takeUpPrice,
                               corLinha, estiloLinhaTake, espessuraTake);
        AdicionarTextoPersonalizado(takeUpLabel, label_time, takeUpPrice + vOffset,
                                    takeTextUp + " (" + DoubleToString(takeUpPrice, _Digits) + ")",
                                    CorTextoTake, fontSizeTake, ANCHOR_LEFT);

        double takeDownPrice = znDownPrice - (takeDistance * i);
        string takeDownName = prefixoObjeto + "TP_VENDA" + IntegerToString(i) + "_" + IntegerToString((int)diaUnicoID);
        string takeDownLabel = prefixoObjeto + "LABEL_VENDA" + IntegerToString(i) + "_" + IntegerToString((int)diaUnicoID);
        string takeTextDown = "TP (Venda) " + IntegerToString(i);

        CriarLinhaPersonalizada(takeDownName, t1_lines, takeDownPrice, final_time_capped, takeDownPrice,
                               corLinha, estiloLinhaTake, espessuraTake);
        AdicionarTextoPersonalizado(takeDownLabel, label_time, takeDownPrice - vOffset,
                                    takeTextDown + " (" + DoubleToString(takeDownPrice, _Digits) + ")",
                                    CorTextoTake, fontSizeTake, ANCHOR_LEFT);
    }
}

//============================
// FUNÇÕES DE TRADING
//============================
void SendTestSignal()
{
    Print("=== TESTE DE INTEGRAÇÃO ===");
    Print("URL: ", EndpointURL);

    // Obter preço atual
    double currentPrice = SymbolInfoDouble(_Symbol, SYMBOL_BID);

    // Criar sinal de teste
    SignalData testSignal;
    testSignal.id = IntegerToString(TimeCurrent()) + "_TEST";
    testSignal.tipo = "COMPRA";
    testSignal.preco_entrada = currentPrice + (200 * _Point);
    testSignal.stop_loss = currentPrice - (200 * _Point);
    testSignal.take_profit[0] = currentPrice + (400 * _Point);
    testSignal.take_profit[1] = currentPrice + (600 * _Point);
    testSignal.take_profit[2] = currentPrice + (800 * _Point);
    testSignal.timestamp = TimeCurrent();
    testSignal.active = true;
    testSignal.sessionName = "TESTE";

    Print("📤 Enviando sinal de TESTE para: ", EndpointURL);
    Print("   Tipo: ", testSignal.tipo);
    Print("   Entrada: ", testSignal.preco_entrada);
    Print("   Stop: ", testSignal.stop_loss);
    Print("   Take 1: ", testSignal.take_profit[0]);
    Print("   Take 2: ", testSignal.take_profit[1]);
    Print("   Take 3: ", testSignal.take_profit[2]);

    bool success = SendSignalToEndpoint(testSignal);

    if(success)
    {
        Alert("✅ TESTE DE INTEGRAÇÃO BEM SUCEDIDO!\n\n" +
              "O sinal de teste foi enviado com sucesso ao backend.\n" +
              "URL: " + EndpointURL);
    }
    else
    {
        Alert("❌ FALHA NO TESTE DE INTEGRAÇÃO!\n\n" +
              "Não foi possível enviar o sinal de teste.\n" +
              "Verifique os logs para mais detalhes.");
    }

    Print("=== FIM DO TESTE ===");
}

void SendManualBuySignal()
{
    if(activeZNCount == 0)
    {
        Alert("⚠️ Nenhuma ZN ativa encontrada. Não é possível enviar sinal de COMPRA.");
        Print("⚠️ Nenhuma ZN ativa para COMPRA");
        return;
    }

    // Pega a ZN mais recente ativa
    int activeZNIndex = -1;
    for(int z = activeZNCount - 1; z >= 0; z--)
    {
        if(activeZNs[z].endTime > 0 && TimeCurrent() < activeZNs[z].endTime)
        {
            activeZNIndex = z;
            break;
        }
    }

    if(activeZNIndex < 0)
    {
        Alert("⚠️ Nenhuma ZN válida encontrada. Não é possível enviar sinal de COMPRA.");
        Print("⚠️ Nenhuma ZN válida para COMPRA");
        return;
    }

    // Verifica se é a primeira ordem manual desta sessão
    bool isFirstOrder = (activeZNs[activeZNIndex].firstManualSignalType == "");

    // Se for segunda ordem, DEVE ser oposta à primeira
    if(!isFirstOrder && activeZNs[activeZNIndex].firstManualSignalType == "COMPRA")
    {
        Alert("⚠️ Segunda ordem deve ser VENDA! A primeira ordem já foi de COMPRA.");
        Print("⚠️ Segunda ordem deve ser oposta à primeira (VENDA)");
        return;
    }

    // Verifica se já foram enviados 2 sinais desta sessão
    if(activeZNs[activeZNIndex].manualBuySignalSent && activeZNs[activeZNIndex].manualSellSignalSent)
    {
        Alert("⚠️ Limite de 2 sinais por sessão atingido!");
        Print("⚠️ Já foram enviados 2 sinais para esta sessão");
        return;
    }

    SignalData signal;
    signal.id = IntegerToString(TimeCurrent()) + "_MANUAL_BUY";
    signal.tipo = "COMPRA";
    signal.sessionName = activeZNs[activeZNIndex].sessionName;
    signal.timestamp = TimeCurrent();
    signal.active = true;
    signal.status = "PENDING"; // Inicia como PENDING
    
    // Armazenar informações da sessão para poder deletar linhas depois
    signal.sessionPrefix = activeZNs[activeZNIndex].sessionPrefix;
    MqlDateTime tm_inicio;
    TimeToStruct(activeZNs[activeZNIndex].startTime, tm_inicio);
    signal.diaUnicoID = (long)tm_inicio.year*10000000000 + (long)tm_inicio.mon*100000000 +
                        (long)tm_inicio.day*1000000 + (long)tm_inicio.hour*10000 +
                        (long)tm_inicio.min*100 + (long)tm_inicio.sec;

    double rangeHeight = activeZNs[activeZNIndex].crTopPrice - activeZNs[activeZNIndex].crBottomPrice;
    
    // 🔍 LER A POSIÇÃO ATUAL DA ZN DO GRÁFICO (usuário pode ter movido!)
    string znLineNameUp = INDICATOR_PREFIX + activeZNs[activeZNIndex].sessionPrefix + "REPL_UP_1" + IntegerToString((int)signal.diaUnicoID);
    double znUpPriceFromChart = activeZNs[activeZNIndex].znUpPrice; // Valor padrão
    
    if(ObjectFind(0, znLineNameUp) >= 0)
    {
        znUpPriceFromChart = ObjectGetDouble(0, znLineNameUp, OBJPROP_PRICE, 0);
        if(MathAbs(znUpPriceFromChart - activeZNs[activeZNIndex].znUpPrice) > (_Point * 10))
        {
            Print("📍 ZN de COMPRA foi movida pelo usuário!");
            Print("   Posição original: ", activeZNs[activeZNIndex].znUpPrice);
            Print("   Posição atual: ", znUpPriceFromChart);
        }
    }

    if(isFirstOrder)
    {
        // 1º SINAL - COMPRA
        // Entrada: ZN Compra (posição atual no gráfico) + 200 pontos
        signal.preco_entrada = znUpPriceFromChart + (200 * _Point);
        // Stop: CR Fundo - 200 pontos
        signal.stop_loss = activeZNs[activeZNIndex].crBottomPrice - (200 * _Point);
        // ZN de acionamento: ZN Compra (posição atual)
        signal.znTriggerPrice = znUpPriceFromChart;

        Print("🟢 1º SINAL - COMPRA (PENDING)");
        Print("   ZN Acionamento: ", signal.znTriggerPrice);
        Print("   Entrada: ZN Compra + 200 = ", signal.preco_entrada);
        Print("   Stop: CR Fundo - 200 = ", signal.stop_loss);

        // Marca como primeira ordem
        activeZNs[activeZNIndex].firstManualSignalType = "COMPRA";
        activeZNs[activeZNIndex].firstManualSignalTime = TimeCurrent();
        activeZNs[activeZNIndex].manualBuySignalSent = true;
    }
    else
    {
        // 2º SINAL - COMPRA (1º foi VENDA)
        // Entrada: CR Topo - 200 pontos (onde foi o stop da venda)
        signal.preco_entrada = activeZNs[activeZNIndex].crTopPrice - (200 * _Point);
        // Stop: ZN Venda - 200 pontos
        signal.stop_loss = activeZNs[activeZNIndex].znDownPrice - (200 * _Point);
        // ZN de acionamento: CR Topo (candle deve fechar ACIMA para acionar)
        signal.znTriggerPrice = activeZNs[activeZNIndex].crTopPrice;

        Print("🔵 2º SINAL - COMPRA (PENDING - 1º foi VENDA)");
        Print("   ZN Acionamento: ", signal.znTriggerPrice);
        Print("   Entrada: CR Topo - 200 = ", signal.preco_entrada);
        Print("   Stop: ZN Venda - 200 = ", signal.stop_loss);

        activeZNs[activeZNIndex].manualBuySignalSent = true;
    }

    // Calcula apenas 3 takes usando os TPs já marcados no gráfico
    double takeDistance = rangeHeight * 2;
    for(int i = 0; i < 3; i++)
        signal.take_profit[i] = signal.preco_entrada + (takeDistance * (i + 1));

    // Zera os demais takes
    for(int i = 3; i < 10; i++)
        signal.take_profit[i] = 0;

    if(SendSignalToEndpoint(signal))
    {
        currentBuySignal = signal;
        hasBuySignal = true;
        Alert("✅ Sinal de COMPRA criado como PENDING!\nAguardando fechamento do candle acima de " + DoubleToString(signal.znTriggerPrice, _Digits));
        Print("✅ Take 1: ", signal.take_profit[0]);
        Print("✅ Take 2: ", signal.take_profit[1]);
        Print("✅ Take 3: ", signal.take_profit[2]);
    }
    else
    {
        Alert("❌ Erro ao enviar sinal de COMPRA!");
        Print("❌ Falha no envio do sinal de COMPRA");
    }
}

void SendManualSellSignal()
{
    if(activeZNCount == 0)
    {
        Alert("⚠️ Nenhuma ZN ativa encontrada. Não é possível enviar sinal de VENDA.");
        Print("⚠️ Nenhuma ZN ativa para VENDA");
        return;
    }

    // Pega a ZN mais recente ativa
    int activeZNIndex = -1;
    for(int z = activeZNCount - 1; z >= 0; z--)
    {
        if(activeZNs[z].endTime > 0 && TimeCurrent() < activeZNs[z].endTime)
        {
            activeZNIndex = z;
            break;
        }
    }

    if(activeZNIndex < 0)
    {
        Alert("⚠️ Nenhuma ZN válida encontrada. Não é possível enviar sinal de VENDA.");
        Print("⚠️ Nenhuma ZN válida para VENDA");
        return;
    }

    // Verifica se é a primeira ordem manual desta sessão
    bool isFirstOrder = (activeZNs[activeZNIndex].firstManualSignalType == "");

    // Se for segunda ordem, DEVE ser oposta à primeira
    if(!isFirstOrder && activeZNs[activeZNIndex].firstManualSignalType == "VENDA")
    {
        Alert("⚠️ Segunda ordem deve ser COMPRA! A primeira ordem já foi de VENDA.");
        Print("⚠️ Segunda ordem deve ser oposta à primeira (COMPRA)");
        return;
    }

    // Verifica se já foram enviados 2 sinais desta sessão
    if(activeZNs[activeZNIndex].manualBuySignalSent && activeZNs[activeZNIndex].manualSellSignalSent)
    {
        Alert("⚠️ Limite de 2 sinais por sessão atingido!");
        Print("⚠️ Já foram enviados 2 sinais para esta sessão");
        return;
    }

    SignalData signal;
    signal.id = IntegerToString(TimeCurrent()) + "_MANUAL_SELL";
    signal.tipo = "VENDA";
    signal.sessionName = activeZNs[activeZNIndex].sessionName;
    signal.timestamp = TimeCurrent();
    signal.active = true;
    signal.status = "PENDING"; // Inicia como PENDING
    
    // Armazenar informações da sessão para poder deletar linhas depois
    signal.sessionPrefix = activeZNs[activeZNIndex].sessionPrefix;
    MqlDateTime tm_inicio;
    TimeToStruct(activeZNs[activeZNIndex].startTime, tm_inicio);
    signal.diaUnicoID = (long)tm_inicio.year*10000000000 + (long)tm_inicio.mon*100000000 +
                        (long)tm_inicio.day*1000000 + (long)tm_inicio.hour*10000 +
                        (long)tm_inicio.min*100 + (long)tm_inicio.sec;

    double rangeHeight = activeZNs[activeZNIndex].crTopPrice - activeZNs[activeZNIndex].crBottomPrice;
    
    // 🔍 LER A POSIÇÃO ATUAL DA ZN DO GRÁFICO (usuário pode ter movido!)
    string znLineNameDown = INDICATOR_PREFIX + activeZNs[activeZNIndex].sessionPrefix + "REPL_DOWN_1" + IntegerToString((int)signal.diaUnicoID);
    double znDownPriceFromChart = activeZNs[activeZNIndex].znDownPrice; // Valor padrão
    
    if(ObjectFind(0, znLineNameDown) >= 0)
    {
        znDownPriceFromChart = ObjectGetDouble(0, znLineNameDown, OBJPROP_PRICE, 0);
        if(MathAbs(znDownPriceFromChart - activeZNs[activeZNIndex].znDownPrice) > (_Point * 10))
        {
            Print("📍 ZN de VENDA foi movida pelo usuário!");
            Print("   Posição original: ", activeZNs[activeZNIndex].znDownPrice);
            Print("   Posição atual: ", znDownPriceFromChart);
        }
    }

    if(isFirstOrder)
    {
        // 1º SINAL - VENDA
        // Entrada: ZN Venda (posição atual no gráfico) - 200 pontos
        signal.preco_entrada = znDownPriceFromChart - (200 * _Point);
        // Stop: CR Topo + 200 pontos
        signal.stop_loss = activeZNs[activeZNIndex].crTopPrice + (200 * _Point);
        // ZN de acionamento: ZN Venda (posição atual)
        signal.znTriggerPrice = znDownPriceFromChart;

        Print("🔴 1º SINAL - VENDA (PENDING)");
        Print("   ZN Acionamento: ", signal.znTriggerPrice);
        Print("   Entrada: ZN Venda - 200 = ", signal.preco_entrada);
        Print("   Stop: CR Topo + 200 = ", signal.stop_loss);

        // Marca como primeira ordem
        activeZNs[activeZNIndex].firstManualSignalType = "VENDA";
        activeZNs[activeZNIndex].firstManualSignalTime = TimeCurrent();
        activeZNs[activeZNIndex].manualSellSignalSent = true;
    }
    else
    {
        // 2º SINAL - VENDA (1º foi COMPRA)
        // Entrada: CR Fundo + 200 pontos (onde foi o stop da compra)
        signal.preco_entrada = activeZNs[activeZNIndex].crBottomPrice + (200 * _Point);
        // Stop: ZN Compra + 200 pontos
        signal.stop_loss = activeZNs[activeZNIndex].znUpPrice + (200 * _Point);
        // ZN de acionamento: CR Fundo (candle deve fechar ABAIXO para acionar)
        signal.znTriggerPrice = activeZNs[activeZNIndex].crBottomPrice;

        Print("🟠 2º SINAL - VENDA (PENDING - 1º foi COMPRA)");
        Print("   ZN Acionamento: ", signal.znTriggerPrice);
        Print("   Entrada: CR Fundo + 200 = ", signal.preco_entrada);
        Print("   Stop: ZN Compra + 200 = ", signal.stop_loss);

        activeZNs[activeZNIndex].manualSellSignalSent = true;
    }

    // Calcula apenas 3 takes usando os TPs já marcados no gráfico
    double takeDistance = rangeHeight * 2;
    for(int i = 0; i < 3; i++)
        signal.take_profit[i] = signal.preco_entrada - (takeDistance * (i + 1));

    // Zera os demais takes
    for(int i = 3; i < 10; i++)
        signal.take_profit[i] = 0;

    if(SendSignalToEndpoint(signal))
    {
        currentSellSignal = signal;
        hasSellSignal = true;
        Alert("✅ Sinal de VENDA criado como PENDING!\nAguardando fechamento do candle abaixo de " + DoubleToString(signal.znTriggerPrice, _Digits));
        Print("✅ Take 1: ", signal.take_profit[0]);
        Print("✅ Take 2: ", signal.take_profit[1]);
        Print("✅ Take 3: ", signal.take_profit[2]);
    }
    else
    {
        Alert("❌ Erro ao enviar sinal de VENDA!");
        Print("❌ Falha no envio do sinal de VENDA");
    }
}

void CheckZNBreakout()
{
    double currentClose = iClose(_Symbol, _Period, 1);

    for(int z = 0; z < activeZNCount; z++)
    {
        if(activeZNs[z].signalSent) continue;
        if(activeZNs[z].endTime > 0 && TimeCurrent() >= activeZNs[z].endTime) continue;

        if(currentClose > activeZNs[z].znUpPrice && !hasBuySignal)
        {
            Print("🔥 ROMPIMENTO DE COMPRA detectado na ZN: ", activeZNs[z].znNameUp);

            SignalData signal;
            signal.id = IntegerToString(TimeCurrent()) + "_BUY";
            signal.tipo = "COMPRA";
            signal.preco_entrada = activeZNs[z].znUpPrice;
            signal.stop_loss = activeZNs[z].crBottomPrice;

            double rangeHeight = activeZNs[z].crTopPrice - activeZNs[z].crBottomPrice;
            double takeDistance = rangeHeight * 2;

            for(int i = 0; i < 10; i++)
                signal.take_profit[i] = activeZNs[z].znUpPrice + (takeDistance * (i+1));

            signal.timestamp = TimeCurrent();
            signal.active = true;
            signal.sessionName = activeZNs[z].sessionName;

            if(SendSignalToEndpoint(signal))
            {
                currentBuySignal = signal;
                hasBuySignal = true;
                activeZNs[z].signalSent = true;
                Print("✅ Sinal de COMPRA enviado com sucesso!");
            }
            break;
        }

        if(currentClose < activeZNs[z].znDownPrice && !hasSellSignal)
        {
            Print("🔥 ROMPIMENTO DE VENDA detectado na ZN: ", activeZNs[z].znNameDown);

            SignalData signal;
            signal.id = IntegerToString(TimeCurrent()) + "_SELL";
            signal.tipo = "VENDA";
            signal.preco_entrada = activeZNs[z].znDownPrice;
            signal.stop_loss = activeZNs[z].crTopPrice;

            double rangeHeight = activeZNs[z].crTopPrice - activeZNs[z].crBottomPrice;
            double takeDistance = rangeHeight * 2;

            for(int i = 0; i < 10; i++)
                signal.take_profit[i] = activeZNs[z].znDownPrice - (takeDistance * (i+1));

            signal.timestamp = TimeCurrent();
            signal.active = true;
            signal.sessionName = activeZNs[z].sessionName;

            if(SendSignalToEndpoint(signal))
            {
                currentSellSignal = signal;
                hasSellSignal = true;
                activeZNs[z].signalSent = true;
                Print("✅ Sinal de VENDA enviado com sucesso!");
            }
            break;
        }
    }
}

bool SendSignalToEndpoint(SignalData &signal)
{
    // Obter data/hora atual no formato "YYYY.MM.DD HH:MM:SS"
    MqlDateTime dt;
    TimeToStruct(signal.timestamp, dt);
    string timeStr = StringFormat("%04d.%02d.%02d %02d:%02d:%02d",
                                  dt.year, dt.mon, dt.day,
                                  dt.hour, dt.min, dt.sec);

    // Converter tipo para inglês (BUY/SELL)
    string tipoIngles = (signal.tipo == "COMPRA") ? "BUY" : "SELL";

    // Preparar JSON no formato do TakePips (compatível com o backend)
    string json = "{"
                + "\"name\":\"AlphaGains\","
                + "\"type\":\"" + tipoIngles + "\","
                + "\"symbol\":\"" + _Symbol + "\","
                + "\"entry\":" + DoubleToString(signal.preco_entrada, _Digits) + ","
                + "\"stopLoss\":" + DoubleToString(signal.stop_loss, _Digits) + ","
                + "\"take1\":" + DoubleToString(signal.take_profit[0], _Digits) + ","
                + "\"take2\":" + DoubleToString(signal.take_profit[1], _Digits) + ","
                + "\"take3\":" + DoubleToString(signal.take_profit[2], _Digits) + ","
                + "\"stopTicks\":200,"
                + "\"time\":\"" + timeStr + "\","
                + "\"sessao\":\"" + signal.sessionName + "\""
                + "}";

    Print("📤 JSON a enviar: ", json);

    // Preparar cabeçalhos HTTP
    string headers = "";
    headers = headers + "Content-Type: application/json\r\n";
    headers = headers + "User-Agent: MetaTrader5\r\n";

    // Preparar dados
    char post[];
    char result[];
    string result_headers;

    // Converter JSON para array de bytes - método correto
    int jsonLen = StringLen(json);
    // Adicionar Content-Length explicitamente
    headers = headers + "Content-Length: " + IntegerToString(jsonLen) + "\r\n";
    // Redimensionar array para o tamanho exato (sem terminador null)
    ArrayResize(post, jsonLen);
    // Converter string para array, sem incluir terminador null
    int copied = StringToCharArray(json, post, 0, jsonLen, CP_UTF8);
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
    int res = WebRequest("POST", EndpointURL, headers, timeout, post, result, result_headers);

    if(res == -1)
    {
        int error = GetLastError();
        Print("❌ Erro WebRequest: ", error);
        Print("URL tentada: ", EndpointURL);

        if(error == 4060)
        {
            Alert("⚠️ Erro 4060: URL não permitida.\n\nAdicione '" + EndpointURL + "' nas URLs permitidas:\nTools -> Options -> Expert Advisors -> Allow WebRequest for listed URL");
        }
        return false;
    }

    // Verificar código de resposta
    string responseStr = CharArrayToString(result);
    if(res >= 200 && res < 300)
    {
        Print("✅ Sinal enviado com sucesso. Status: ", res);
        Print("📡 Resposta: ", responseStr);
        
        // Extrair o UUID da resposta JSON: {"success":true,"data":{"id":"uuid-aqui",...}}
        int idPos = StringFind(responseStr, "\"id\":\"");
        if(idPos >= 0)
        {
            idPos += 6; // Pular 6 caracteres: "id":"
            int idEnd = StringFind(responseStr, "\"", idPos);
            if(idEnd > idPos)
            {
                string uuid = StringSubstr(responseStr, idPos, idEnd - idPos);
                signal.id = uuid; // Atualizar o ID do sinal com o UUID real
                Print("🆔 UUID do sinal: ", uuid);
            }
        }
        
        return true;
    }
    else
    {
        Print("❌ Erro na resposta do servidor. Código: ", res);
        Print("📡 Resposta: ", responseStr);
        return false;
    }
}

void CheckPendingSignalActivation()
{
    // Verifica se há sinal de COMPRA PENDING aguardando acionamento
    if(hasBuySignal && currentBuySignal.status == "PENDING")
    {
        // Pega o fechamento do último candle completo
        double lastClose = iClose(_Symbol, _Period, 1);

        Print("📊 Verificando COMPRA PENDING: Close[1]=", lastClose, " | ZN=", currentBuySignal.znTriggerPrice);

        // Para COMPRA: candle deve fechar ACIMA da ZN de acionamento
        if(lastClose > currentBuySignal.znTriggerPrice)
        {
            Print("🔥 ORDEM DE COMPRA ACIONADA! Candle fechou em ", lastClose, " acima da ZN ", currentBuySignal.znTriggerPrice);

            // Atualizar status para EM_OPERACAO
            if(UpdateSignalStatus(currentBuySignal.id, "EM_OPERACAO", lastClose))
            {
                currentBuySignal.status = "EM_OPERACAO";
                
                Alert("🚀 ORDEM DE COMPRA ACIONADA!\n" +
                      "Preço: " + DoubleToString(lastClose, _Digits) + "\n" +
                      "Entrada: " + DoubleToString(currentBuySignal.preco_entrada, _Digits) + "\n" +
                      "Stop: " + DoubleToString(currentBuySignal.stop_loss, _Digits) + "\n\n" +
                      "💡 Dica: Mova a ZN de VENDA para ajustar a 2ª entrada e clique em UPDATE");
                Print("✅ Status atualizado para EM_OPERACAO");
            }
        }
        else
        {
            Print("⏳ Aguardando rompimento: Close precisa ser > ", currentBuySignal.znTriggerPrice);
        }
    }

    // Verifica se há sinal de VENDA PENDING aguardando acionamento
    if(hasSellSignal && currentSellSignal.status == "PENDING")
    {
        // Pega o fechamento do último candle completo
        double lastClose = iClose(_Symbol, _Period, 1);

        Print("📊 Verificando VENDA PENDING: Close[1]=", lastClose, " | ZN=", currentSellSignal.znTriggerPrice);

        // Para VENDA: candle deve fechar ABAIXO da ZN de acionamento
        if(lastClose < currentSellSignal.znTriggerPrice)
        {
            Print("🔥 ORDEM DE VENDA ACIONADA! Candle fechou em ", lastClose, " abaixo da ZN ", currentSellSignal.znTriggerPrice);

            // Atualizar status para EM_OPERACAO
            if(UpdateSignalStatus(currentSellSignal.id, "EM_OPERACAO", lastClose))
            {
                currentSellSignal.status = "EM_OPERACAO";
                
                Alert("🚀 ORDEM DE VENDA ACIONADA!\n" +
                      "Preço: " + DoubleToString(lastClose, _Digits) + "\n" +
                      "Entrada: " + DoubleToString(currentSellSignal.preco_entrada, _Digits) + "\n" +
                      "Stop: " + DoubleToString(currentSellSignal.stop_loss, _Digits) + "\n\n" +
                      "💡 Dica: Mova a ZN de COMPRA para ajustar a 2ª entrada e clique em UPDATE");
                Print("✅ Status atualizado para EM_OPERACAO");
            }
        }
        else
        {
            Print("⏳ Aguardando rompimento: Close precisa ser < ", currentSellSignal.znTriggerPrice);
        }
    }
}

void MonitorPriceLevels()
{
    // Só monitora se houver sinal EM_OPERACAO
    if(!hasBuySignal && !hasSellSignal) return;

    double currentBid = SymbolInfoDouble(_Symbol, SYMBOL_BID);

    // Monitorar sinal de COMPRA (apenas se estiver EM_OPERACAO)
    if(hasBuySignal && currentBuySignal.status == "EM_OPERACAO")
    {
        // Verifica TAKE 1
        if(currentBuySignal.take_profit[0] > 0 && currentBid >= currentBuySignal.take_profit[0])
        {
            UpdateSignalStatus(currentBuySignal.id, "TAKE1", currentBid);
            Alert("🎯 TAKE 1 atingido em COMPRA!\nPreço: " + DoubleToString(currentBid, _Digits) + "\n✅ Operação garantida! Stop não é mais monitorado.");
            Print("✅ TAKE 1 atingido. Stop desativado. Agora monitorando apenas TAKE 2 e 3");
            currentBuySignal.take_profit[0] = 0; // Para de monitorar Take1
            currentBuySignal.stop_loss = 0; // DESATIVA o stop - Take1 é o objetivo principal
            return;
        }

        // Verifica STOP LOSS (só se Take1 ainda NÃO foi atingido)
        if(currentBuySignal.take_profit[0] > 0 && currentBid <= currentBuySignal.stop_loss)
        {
            UpdateSignalStatus(currentBuySignal.id, "STOP_LOSS", currentBid);
            Alert("⛔ STOP LOSS atingido em COMPRA!\nPreço: " + DoubleToString(currentBid, _Digits));
            EncerrarSinal(currentBuySignal.id);
            hasBuySignal = false;
            Print("❌ Sinal de COMPRA encerrado por STOP LOSS");
            return;
        }

        // Verifica TAKE 2 (só se Take1 já foi zerado)
        if(currentBuySignal.take_profit[0] == 0 && currentBuySignal.take_profit[1] > 0 && currentBid >= currentBuySignal.take_profit[1])
        {
            UpdateSignalStatus(currentBuySignal.id, "TAKE2", currentBid);
            Alert("🎯🎯 TAKE 2 atingido em COMPRA!\nPreço: " + DoubleToString(currentBid, _Digits));
            Print("✅✅ TAKE 2 atingido. Agora monitorando apenas TAKE 3");
            currentBuySignal.take_profit[1] = 0; // Para de monitorar Take2
            return;
        }

        // Verifica TAKE 3 (só se Take1 e Take2 já foram zerados)
        if(currentBuySignal.take_profit[0] == 0 && currentBuySignal.take_profit[1] == 0 &&
           currentBuySignal.take_profit[2] > 0 && currentBid >= currentBuySignal.take_profit[2])
        {
            UpdateSignalStatus(currentBuySignal.id, "TAKE3", currentBid);
            Alert("🎯🎯🎯 TAKE 3 (FINAL) atingido em COMPRA!\nPreço: " + DoubleToString(currentBid, _Digits));
            Print("✅✅✅ TAKE 3 atingido. Operação ENCERRADA com sucesso!");
            EncerrarSinal(currentBuySignal.id);
            hasBuySignal = false;
            return;
        }

        // Se Take1 já foi atingido (take_profit[0] == 0) mas o preço voltou e não atingiu Take2/Take3
        // Apenas encerra silenciosamente sem registrar como STOP
        if(currentBuySignal.take_profit[0] == 0 && currentBuySignal.stop_loss == 0)
        {
            // Operação já garantiu Take1, não há mais nada a monitorar se não atingir Take2/Take3
            // Pode adicionar lógica de trailing stop ou break-even aqui se desejar
        }
    }

    // Monitorar sinal de VENDA (apenas se estiver EM_OPERACAO)
    if(hasSellSignal && currentSellSignal.status == "EM_OPERACAO")
    {
        // Verifica TAKE 1
        if(currentSellSignal.take_profit[0] > 0 && currentBid <= currentSellSignal.take_profit[0])
        {
            UpdateSignalStatus(currentSellSignal.id, "TAKE1", currentBid);
            Alert("🎯 TAKE 1 atingido em VENDA!\nPreço: " + DoubleToString(currentBid, _Digits) + "\n✅ Operação garantida! Stop não é mais monitorado.");
            Print("✅ TAKE 1 atingido. Stop desativado. Agora monitorando apenas TAKE 2 e 3");
            currentSellSignal.take_profit[0] = 0; // Para de monitorar Take1
            currentSellSignal.stop_loss = 0; // DESATIVA o stop - Take1 é o objetivo principal
            return;
        }

        // Verifica STOP LOSS (só se Take1 ainda NÃO foi atingido)
        if(currentSellSignal.take_profit[0] > 0 && currentBid >= currentSellSignal.stop_loss)
        {
            UpdateSignalStatus(currentSellSignal.id, "STOP_LOSS", currentBid);
            Alert("⛔ STOP LOSS atingido em VENDA!\nPreço: " + DoubleToString(currentBid, _Digits));
            EncerrarSinal(currentSellSignal.id);
            hasSellSignal = false;
            Print("❌ Sinal de VENDA encerrado por STOP LOSS");
            return;
        }

        // Verifica TAKE 2 (só se Take1 já foi zerado)
        if(currentSellSignal.take_profit[0] == 0 && currentSellSignal.take_profit[1] > 0 && currentBid <= currentSellSignal.take_profit[1])
        {
            UpdateSignalStatus(currentSellSignal.id, "TAKE2", currentBid);
            Alert("🎯🎯 TAKE 2 atingido em VENDA!\nPreço: " + DoubleToString(currentBid, _Digits));
            Print("✅✅ TAKE 2 atingido. Agora monitorando apenas TAKE 3");
            currentSellSignal.take_profit[1] = 0; // Para de monitorar Take2
            return;
        }

        // Verifica TAKE 3 (só se Take1 e Take2 já foram zerados)
        if(currentSellSignal.take_profit[0] == 0 && currentSellSignal.take_profit[1] == 0 &&
           currentSellSignal.take_profit[2] > 0 && currentBid <= currentSellSignal.take_profit[2])
        {
            UpdateSignalStatus(currentSellSignal.id, "TAKE3", currentBid);
            Alert("🎯🎯🎯 TAKE 3 (FINAL) atingido em VENDA!\nPreço: " + DoubleToString(currentBid, _Digits));
            Print("✅✅✅ TAKE 3 atingido. Operação ENCERRADA com sucesso!");
            EncerrarSinal(currentSellSignal.id);
            hasSellSignal = false;
            return;
        }

        // Se Take1 já foi atingido (take_profit[0] == 0) mas o preço voltou e não atingiu Take2/Take3
        // Apenas encerra silenciosamente sem registrar como STOP
        if(currentSellSignal.take_profit[0] == 0 && currentSellSignal.stop_loss == 0)
        {
            // Operação já garantiu Take1, não há mais nada a monitorar se não atingir Take2/Take3
            // Pode adicionar lógica de trailing stop ou break-even aqui se desejar
        }
    }
}

bool UpdateSignalStatus(string signalId, string status, double preco_saida)
{
    char data[];
    char result[];
    string headers = "Content-Type: application/json\r\n";

    string json = "{";
    json += "\"id\":\"" + signalId + "\",";
    json += "\"status\":\"" + status + "\",";
    json += "\"hitPrice\":" + DoubleToString(preco_saida, _Digits);
    json += "}";

    StringToCharArray(json, data, 0, StringLen(json));

    int timeout = 5000;
    string url = EndpointURL + "/update-status";
    int res = WebRequest("POST", url, headers, timeout, data, result, headers);

    if(res == 200 || res == 201)
    {
        Print("📡 Status do sinal atualizado: ", status);
        return true;
    }
    else
    {
        Print("❌ Erro ao atualizar status. Código HTTP: ", res);
        return false;
    }
}

void EncerrarSinal(string signalId)
{
    Print("🔚 Encerrando sinal: ", signalId);
}

void UpdateSignalFromZNMovement()
{
    Print("🔄 Botão UPDATE pressionado - Verificando ajuste de ZNs...");
    
    // Verifica se há sinal de COMPRA ativo
    if(hasBuySignal)
    {
        // Buscar a linha da ZN de COMPRA atual no gráfico
        string znLineName = INDICATOR_PREFIX + currentBuySignal.sessionPrefix + "REPL_UP_1" + IntegerToString((int)currentBuySignal.diaUnicoID);
        
        if(ObjectFind(0, znLineName) >= 0)
        {
            // Ler o preço atual da ZN (pode ter sido movida pelo usuário)
            double newZNPrice = ObjectGetDouble(0, znLineName, OBJPROP_PRICE, 0); // 0 = primeiro ponto da linha
            double oldEntry = currentBuySignal.preco_entrada;
            double newEntry = newZNPrice + (200 * _Point);
            
            if(MathAbs(newEntry - oldEntry) > (_Point * 10)) // Mudança significativa (>10 pontos)
            {
                Print("📝 ZN de COMPRA movida: ", currentBuySignal.znTriggerPrice, " → ", newZNPrice);
                Print("   Nova Entrada: ", oldEntry, " → ", newEntry);
                
                // Atualizar localmente
                currentBuySignal.znTriggerPrice = newZNPrice;
                currentBuySignal.preco_entrada = newEntry;
                
                // Enviar atualização para a API
                if(UpdateSignalEntry(currentBuySignal.id, newEntry))
                {
                    Alert("✅ Entrada de COMPRA atualizada!\n" +
                          "Nova ZN: " + DoubleToString(newZNPrice, _Digits) + "\n" +
                          "Nova Entrada: " + DoubleToString(newEntry, _Digits));
                }
            }
            else
            {
                Print("ℹ️ ZN de COMPRA não foi movida significativamente");
            }
        }
    }
    
    // Verifica se há sinal de VENDA ativo
    if(hasSellSignal)
    {
        // Buscar a linha da ZN de VENDA atual no gráfico
        string znLineName = INDICATOR_PREFIX + currentSellSignal.sessionPrefix + "REPL_DOWN_1" + IntegerToString((int)currentSellSignal.diaUnicoID);
        
        if(ObjectFind(0, znLineName) >= 0)
        {
            // Ler o preço atual da ZN (pode ter sido movida pelo usuário)
            double newZNPrice = ObjectGetDouble(0, znLineName, OBJPROP_PRICE, 0); // 0 = primeiro ponto da linha
            double oldEntry = currentSellSignal.preco_entrada;
            double newEntry = newZNPrice - (200 * _Point);
            
            if(MathAbs(newEntry - oldEntry) > (_Point * 10)) // Mudança significativa (>10 pontos)
            {
                Print("📝 ZN de VENDA movida: ", currentSellSignal.znTriggerPrice, " → ", newZNPrice);
                Print("   Nova Entrada: ", oldEntry, " → ", newEntry);
                
                // Atualizar localmente
                currentSellSignal.znTriggerPrice = newZNPrice;
                currentSellSignal.preco_entrada = newEntry;
                
                // Enviar atualização para a API
                if(UpdateSignalEntry(currentSellSignal.id, newEntry))
                {
                    Alert("✅ Entrada de VENDA atualizada!\n" +
                          "Nova ZN: " + DoubleToString(newZNPrice, _Digits) + "\n" +
                          "Nova Entrada: " + DoubleToString(newEntry, _Digits));
                }
            }
            else
            {
                Print("ℹ️ ZN de VENDA não foi movida significativamente");
            }
        }
    }
    
    if(!hasBuySignal && !hasSellSignal)
    {
        Print("⚠️ Nenhum sinal ativo para atualizar");
        Alert("⚠️ Nenhum sinal ativo.\nEnvie um sinal antes de usar UPDATE.");
    }
}

bool UpdateSignalEntry(string signalId, double newEntry)
{
    // Fazer requisição PATCH para atualizar entrada
    string url = EndpointURL + "/" + signalId;
    string json = "{\"entry\":" + DoubleToString(newEntry, _Digits) + "}";
    
    Print("📤 Atualizando entrada via API: ", json);
    Print("   URL: ", url);
    
    char post[];
    char result[];
    string headers = "Content-Type: application/json\r\n";
    string result_headers;
    
    int jsonLen = StringLen(json);
    ArrayResize(post, jsonLen);
    StringToCharArray(json, post, 0, jsonLen, CP_UTF8);
    
    int timeout = 5000;
    int res = WebRequest("PATCH", url, headers, timeout, post, result, result_headers);
    
    if(res == -1)
    {
        Print("❌ Erro WebRequest: ", GetLastError());
        return false;
    }
    
    string responseStr = CharArrayToString(result);
    if(res >= 200 && res < 300)
    {
        Print("✅ Entrada atualizada com sucesso! Status: ", res);
        Print("📡 Resposta: ", responseStr);
        return true;
    }
    else
    {
        Print("❌ Erro ao atualizar entrada. Código: ", res);
        Print("📡 Resposta: ", responseStr);
        return false;
    }
}

void CreateButtons()
{
    int x = 20, y = 50, width = 100, height = 30, spacing = 10;

    ObjectCreate(0, "BtnBuy", OBJ_BUTTON, 0, 0, 0);
    ObjectSetInteger(0, "BtnBuy", OBJPROP_XDISTANCE, x);
    ObjectSetInteger(0, "BtnBuy", OBJPROP_YDISTANCE, y);
    ObjectSetInteger(0, "BtnBuy", OBJPROP_XSIZE, width);
    ObjectSetInteger(0, "BtnBuy", OBJPROP_YSIZE, height);
    ObjectSetString(0, "BtnBuy", OBJPROP_TEXT, "BUY");
    ObjectSetInteger(0, "BtnBuy", OBJPROP_COLOR, clrWhite);
    ObjectSetInteger(0, "BtnBuy", OBJPROP_BGCOLOR, clrGreen);

    ObjectCreate(0, "BtnSell", OBJ_BUTTON, 0, 0, 0);
    ObjectSetInteger(0, "BtnSell", OBJPROP_XDISTANCE, x + width + spacing);
    ObjectSetInteger(0, "BtnSell", OBJPROP_YDISTANCE, y);
    ObjectSetInteger(0, "BtnSell", OBJPROP_XSIZE, width);
    ObjectSetInteger(0, "BtnSell", OBJPROP_YSIZE, height);
    ObjectSetString(0, "BtnSell", OBJPROP_TEXT, "SELL");
    ObjectSetInteger(0, "BtnSell", OBJPROP_COLOR, clrWhite);
    ObjectSetInteger(0, "BtnSell", OBJPROP_BGCOLOR, clrRed);

    ObjectCreate(0, "BtnReset", OBJ_BUTTON, 0, 0, 0);
    ObjectSetInteger(0, "BtnReset", OBJPROP_XDISTANCE, x);
    ObjectSetInteger(0, "BtnReset", OBJPROP_YDISTANCE, y + height + spacing);
    ObjectSetInteger(0, "BtnReset", OBJPROP_XSIZE, width);
    ObjectSetInteger(0, "BtnReset", OBJPROP_YSIZE, height);
    ObjectSetString(0, "BtnReset", OBJPROP_TEXT, "Reset");
    ObjectSetInteger(0, "BtnReset", OBJPROP_COLOR, clrWhite);
    ObjectSetInteger(0, "BtnReset", OBJPROP_BGCOLOR, clrOrange);

    ObjectCreate(0, "BtnUpdate", OBJ_BUTTON, 0, 0, 0);
    ObjectSetInteger(0, "BtnUpdate", OBJPROP_XDISTANCE, x + width + spacing);
    ObjectSetInteger(0, "BtnUpdate", OBJPROP_YDISTANCE, y + height + spacing);
    ObjectSetInteger(0, "BtnUpdate", OBJPROP_XSIZE, width);
    ObjectSetInteger(0, "BtnUpdate", OBJPROP_YSIZE, height);
    ObjectSetString(0, "BtnUpdate", OBJPROP_TEXT, "Update");
    ObjectSetInteger(0, "BtnUpdate", OBJPROP_COLOR, clrWhite);
    ObjectSetInteger(0, "BtnUpdate", OBJPROP_BGCOLOR, clrBlue);
}

void OnChartEvent(const int id, const long &lparam, const double &dparam, const string &sparam)
{
    if(id == CHARTEVENT_OBJECT_CLICK)
    {
        if(sparam == "BtnBuy")
        {
            Print("🔵 Botão BUY pressionado");
            ObjectSetInteger(0, "BtnBuy", OBJPROP_STATE, false);
            SendManualBuySignal();
        }
        else if(sparam == "BtnSell")
        {
            Print("🔴 Botão SELL pressionado");
            ObjectSetInteger(0, "BtnSell", OBJPROP_STATE, false);
            SendManualSellSignal();
        }
        else if(sparam == "BtnReset")
        {
            Print("🔄 Botão Reset pressionado");
            ObjectSetInteger(0, "BtnReset", OBJPROP_STATE, false);
            hasBuySignal = false;
            hasSellSignal = false;
        }
        else if(sparam == "BtnUpdate")
        {
            Print("🔄 Botão Update pressionado");
            ObjectSetInteger(0, "BtnUpdate", OBJPROP_STATE, false);
            UpdateSignalFromZNMovement();
            ChartRedraw();
        }
    }
}
