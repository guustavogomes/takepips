//+------------------------------------------------------------------+
//|         MarlonAlphaGains 2.0  (Unificado)         |
//|                        by Marlon Brito              |
//+------------------------------------------------------------------+
#property copyright "MarlonAlphaGains13/05/2025-CliqueAqui"
#property link      "https://chat.whatsapp.com/EYdrlQgIhkGKjazp8w4ZhM"
#property link      "wa.ma//5515981005698"
#property description "Todos Os Direitos Reservados - AlphaGains wa.ma//5515981005698 "
#property description "Chega de operar no escuro! Conheça o indicador que está revolucionando o mercado.Você já se sentiu perdido diante dos gráficos, sem saber se entra ou sai de uma operação, com medo de perder dinheiro por causa de uma decisão errada? Eu sei exatamente como é essa sensação…"
#property version   "2.0"
#property strict
#property indicator_chart_window
#property indicator_buffers 1
#property indicator_plots   1

// Buffer dummy
double dummyBuffer[];

//============================
// LICENÇA (AlphaGains) - Contas autorizadas no código
//============================
#define DATA_EXPIRACAO "31.12.2025"
#define CONTA_PERMITIDA1 10184374
#define CONTA_PERMITIDA2 341015440
#define CONTA_PERMITIDA3 566595

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
input int    espessuraCR                 = 4;
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
input ENUM_DISPLAY_MODE modoExibicao = DISPLAY_TODAY; // <<< MODO EXPANDIDO

input group "Sessão 1"
input bool   enableSession1          = true;
input string sessionName1            = "CANDLE H4 - 19H";
input string sessionTime1            = "01:05";
input int    minSessionBars1         = 1;
input int    maxSessionBars1         = 4;
input color  sessionTopoColor1       = clrRed;
input color  sessionFundoColor1      = clrLime;
input string InpNomeZNUp_Ses1        = "ZN (Compra) 19H";
input string InpNomeZNDown_Ses1      = "ZN (Venda) 19H";

input group "Sessão 2"
input bool   enableSession2          = true;
input string sessionName2            = "CANDLE H4 - 22H";
input string sessionTime2            = "04:00";
input int    minSessionBars2         = 1;
input int    maxSessionBars2         = 4;
input color  sessionTopoColor2       = clrAqua;
input color  sessionFundoColor2      = clrBlue;
input string InpNomeZNUp_Ses2        = "ZN (Compra) 22H";
input string InpNomeZNDown_Ses2      = "ZN (Venda) 22H";

input group "Sessão 3"
input bool   enableSession3          = true;
input string sessionName3            = "CANDLE H4 - 2H";
input string sessionTime3            = "08:00";
input int    minSessionBars3         = 1;
input int    maxSessionBars3         = 4;
input color  sessionTopoColor3       = clrOrange;
input color  sessionFundoColor3      = clrGold;
input string InpNomeZNUp_Ses3        = "ZN (Compra) 2H";
input string InpNomeZNDown_Ses3      = "ZN (Venda) 2H";

input group "Sessão 4"
input bool   enableSession4          = true;
input string sessionName4            = "CANDLE H4 - 6H";
input string sessionTime4            = "12:00";
input int    minSessionBars4         = 1;
input int    maxSessionBars4         = 4;
input color  sessionTopoColor4       = clrMagenta;
input color  sessionFundoColor4      = clrPurple;
input string InpNomeZNUp_Ses4        = "ZN (Compra) 6H";
input string InpNomeZNDown_Ses4      = "ZN (Venda) 6H";

input group "Sessão 5"
input bool   enableSession5          = true;
input string sessionName5            = "CANDLE H4 - 10H";
input string sessionTime5            = "16:00";
input int    minSessionBars5         = 1;
input int    maxSessionBars5         = 4;
input color  sessionTopoColor5       = clrCyan;
input color  sessionFundoColor5      = clrYellow;
input string InpNomeZNUp_Ses5        = "ZN (Compra) 10H";
input string InpNomeZNDown_Ses5      = "ZN (Venda) 10H";

input group "Sessão 6"
input bool   enableSession6          = false;
input string sessionName6            = "Sessão Extra 3";
input string sessionTime6            = "23:00";
input int    minSessionBars6         = 1;
input int    maxSessionBars6         = 4;
input color  sessionTopoColor6       = clrDarkSalmon;
input color  sessionFundoColor6      = clrSalmon;
input string InpNomeZNUp_Ses6        = "ZN Extra 3 Superior";
input string InpNomeZNDown_Ses6      = "ZN Extra 3 Inferior";

input group "Sessão 7"
input bool   enableSession7          = false;
input string sessionName7            = "Sessão Extra 4";
input string sessionTime7            = "03:00";
input int    minSessionBars7         = 1;
input int    maxSessionBars7         = 4;
input color  sessionTopoColor7       = clrCoral;
input color  sessionFundoColor7      = clrTomato;
input string InpNomeZNUp_Ses7        = "ZN Extra 4 Superior";
input string InpNomeZNDown_Ses7      = "ZN Extra 4 Inferior";

input group "Sessão 8"
input bool   enableSession8          = false;
input string sessionName8            = "Sessão Extra 5";
input string sessionTime8            = "07:00";
input int    minSessionBars8         = 1;
input int    maxSessionBars8         = 4;
input color  sessionTopoColor8       = clrOlive;
input color  sessionFundoColor8      = clrOliveDrab;
input string InpNomeZNUp_Ses8        = "ZN Extra 5 Superior";
input string InpNomeZNDown_Ses8      = "ZN Extra 5 Inferior";

// Prefixos e constantes
#define INDICATOR_PREFIX "PPIPS_"
#define PREFIX_SES1 "SES1_"
#define PREFIX_SES2 "SES2_"
#define PREFIX_SES3 "SES3_"
#define PREFIX_SES4 "SES4_"
#define PREFIX_SES5 "SES5_"
#define PREFIX_SES6 "SES6_"
#define PREFIX_SES7 "SES7_"
#define PREFIX_SES8 "SES8_"

//============================
// DECLARAÇÕES GLOBAIS
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
};

int lastCalculatedBar = 0;
bool AlertTriggered[];
ActiveZN activeZNs[100];
int activeZNCount = 0;
string currentActiveSession = "";
datetime lastProcessedDay = 0;
ENUM_DISPLAY_MODE lastModoExibicao = DISPLAY_TODAY;

bool licenseValid = false; // set in OnInit se tudo OK

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

//============================
// OnInit - verifica licença + inicializa scalper
//============================
int OnInit()
{
   // associar buffer dummy para evitar aviso de buffer não definido
   SetIndexBuffer(0, dummyBuffer);

   // Verificação de Data
   datetime expire = StringToTime(DATA_EXPIRACAO);
   if(TimeCurrent() > expire)
   {
      Alert("⚠️ Licença expirada em ", DATA_EXPIRACAO, ". Contate suporte: wa.me//5515981005698");
      Print("⚠️ Licença expirada em ", DATA_EXPIRACAO);
      return(INIT_FAILED);
   }

   // Verificação de Conta
   long contaAtual = AccountInfoInteger(ACCOUNT_LOGIN);
   if (contaAtual != CONTA_PERMITIDA1 && contaAtual != CONTA_PERMITIDA2 && contaAtual != CONTA_PERMITIDA3)
   {
      Alert("🚫 Conta não autorizada: ", contaAtual, ". Contate suporte: wa.me//5515981005698 .");
      Print("🚫 Conta não autorizada: ", contaAtual);
      return(INIT_FAILED);
   }

   licenseValid = true;
   Print("✅ Licença validada para conta ", contaAtual, " até ", DATA_EXPIRACAO);

   // Inicialização do scalper
   ArrayInitialize(AlertTriggered, false);
   activeZNCount = 0;
   for(int i = 0; i < 100; i++) activeZNs[i] = ActiveZN();

   Print("🟢 AlphaPauloPips (unificado) carregado. Modo: ", EnumToString(modoExibicao));
   return(INIT_SUCCEEDED);
}

//============================
// OnDeinit
//============================
void OnDeinit(const int reason)
{
    DeleteObjectsByPrefix(INDICATOR_PREFIX);
    Print("🔴 Indicador desativado.");
}

//============================
// OnCalculate - toda a lógica do PauloPipsScalper integrada
//============================
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
    // Se licença inválida, não executa lógica
    if(!licenseValid)
    {
        return(prev_calculated);
    }

    if(rates_total < 5) return(0);

    if(rates_total > prev_calculated)
    {
        ArrayResize(AlertTriggered, rates_total);
        for(int i = prev_calculated; i < rates_total; i++) AlertTriggered[i] = false;
    }

    int start_index = (prev_calculated > 0) ? prev_calculated - 1 : 0;

    // Limpeza ao mudar de dia ou modo de exibição
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

    // Monta array de sessões
    SessionData sessions[8];
    sessions[0].enable = enableSession1; sessions[0].name = sessionName1; sessions[0].timeStr = sessionTime1;
    sessions[0].minBars = minSessionBars1; sessions[0].maxBars = maxSessionBars1; sessions[0].topoColor = sessionTopoColor1; sessions[0].fundoColor = sessionFundoColor1;
    sessions[0].prefix = PREFIX_SES1; sessions[0].znNameUp = InpNomeZNUp_Ses1; sessions[0].znNameDown = InpNomeZNDown_Ses1;
    sessions[1].enable = enableSession2; sessions[1].name = sessionName2; sessions[1].timeStr = sessionTime2;
    sessions[1].minBars = minSessionBars2; sessions[1].maxBars = maxSessionBars2; sessions[1].topoColor = sessionTopoColor2; sessions[1].fundoColor = sessionFundoColor2;
    sessions[1].prefix = PREFIX_SES2; sessions[1].znNameUp = InpNomeZNUp_Ses2; sessions[1].znNameDown = InpNomeZNDown_Ses2;
    sessions[2].enable = enableSession3; sessions[2].name = sessionName3; sessions[2].timeStr = sessionTime3;
    sessions[2].minBars = minSessionBars3; sessions[2].maxBars = maxSessionBars3; sessions[2].topoColor = sessionTopoColor3; sessions[2].fundoColor = sessionFundoColor3;
    sessions[2].prefix = PREFIX_SES3; sessions[2].znNameUp = InpNomeZNUp_Ses3; sessions[2].znNameDown = InpNomeZNDown_Ses3;
    sessions[3].enable = enableSession4; sessions[3].name = sessionName4; sessions[3].timeStr = sessionTime4;
    sessions[3].minBars = minSessionBars4; sessions[3].maxBars = maxSessionBars4; sessions[3].topoColor = sessionTopoColor4; sessions[3].fundoColor = sessionFundoColor4;
    sessions[3].prefix = PREFIX_SES4; sessions[3].znNameUp = InpNomeZNUp_Ses4; sessions[3].znNameDown = InpNomeZNDown_Ses4;
    sessions[4].enable = enableSession5; sessions[4].name = sessionName5; sessions[4].timeStr = sessionTime5;
    sessions[4].minBars = minSessionBars5; sessions[4].maxBars = maxSessionBars5; sessions[4].topoColor = sessionTopoColor5; sessions[4].fundoColor = sessionFundoColor5;
    sessions[4].prefix = PREFIX_SES5; sessions[4].znNameUp = InpNomeZNUp_Ses5; sessions[4].znNameDown = InpNomeZNDown_Ses5;
    sessions[5].enable = enableSession6; sessions[5].name = sessionName6; sessions[5].timeStr = sessionTime6;
    sessions[5].minBars = minSessionBars6; sessions[5].maxBars = maxSessionBars6; sessions[5].topoColor = sessionTopoColor6; sessions[5].fundoColor = sessionFundoColor6;
    sessions[5].prefix = PREFIX_SES6; sessions[5].znNameUp = InpNomeZNUp_Ses6; sessions[5].znNameDown = InpNomeZNDown_Ses6;
    sessions[6].enable = enableSession7; sessions[6].name = sessionName7; sessions[6].timeStr = sessionTime7;
    sessions[6].minBars = minSessionBars7; sessions[6].maxBars = maxSessionBars7; sessions[6].topoColor = sessionTopoColor7; sessions[6].fundoColor = sessionFundoColor7;
    sessions[6].prefix = PREFIX_SES7; sessions[6].znNameUp = InpNomeZNUp_Ses7; sessions[6].znNameDown = InpNomeZNDown_Ses7;
    sessions[7].enable = enableSession8; sessions[7].name = sessionName8; sessions[7].timeStr = sessionTime8;
    sessions[7].minBars = minSessionBars8; sessions[7].maxBars = maxSessionBars8; sessions[7].topoColor = sessionTopoColor8; sessions[7].fundoColor = sessionFundoColor8;
    sessions[7].prefix = PREFIX_SES8; sessions[7].znNameUp = InpNomeZNUp_Ses8; sessions[7].znNameDown = InpNomeZNDown_Ses8;

    // valida horários
    for(int s=0; s<8; s++)
    {
        if(sessions[s].enable)
        {
            if(!ParseHHMM(sessions[s].timeStr, sessions[s].hour, sessions[s].minute))
            {
                Print("🔴 Erro: Formato de horário inválido para a Sessão ", sessions[s].name, ". Use HH:MM");
                return(prev_calculated);
            }
        }
    }

    datetime currentTime = time[rates_total-1];

    // remoção de ZNs expiradas
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

    // detectar e adicionar novas ZNs
    for(int i = rates_total - 1; i >= start_index; i--)
    {
        for(int j = 0; j < 8; j++)
        {
            if(!sessions[j].enable) continue;
            MqlDateTime tm_bar; TimeToStruct(time[i], tm_bar);
            if(tm_bar.hour == sessions[j].hour && tm_bar.min == sessions[j].minute)
            {
                datetime displayLimit = GetDisplayLimitTime(modoExibicao, mesesParaTras);
                if(time[i] < displayLimit) continue;

                bool alreadyExists = false;
                for(int z = 0; z < activeZNCount; z++) if(activeZNs[z].startTime == time[i]) { alreadyExists = true; break; }
                if(alreadyExists) continue;

                datetime next_session_start = FindNextSessionTime(time[i], sessions, j);

                double topo = -DBL_MAX; double fundo = DBL_MAX;
                int actual_session_bars = 0;

                for(int k = 0; k < sessions[j].maxBars && (i + k) < rates_total; k++)
                {
                    if(useWicksForCR)
                    {
                        if(high[i+k] > topo) topo = high[i+k];
                        if(low[i+k] < fundo) fundo = low[i+k];
                    }
                    else
                    {
                        double max_candle = MathMax(open[i+k], close[i+k]);
                        double min_candle = MathMin(open[i+k], close[i+k]);
                        if(max_candle > topo) topo = max_candle;
                        if(min_candle < fundo) fundo = min_candle;
                    }

                    if( (topo - fundo) / _Point >= pontosMinimosCR && (k+1) >= sessions[j].minBars )
                    {
                        actual_session_bars = k + 1;
                        break;
                    }
                    if( (k+1) == sessions[j].maxBars ) actual_session_bars = k + 1;
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
                    activeZNCount++;

                    Print("🟢 Nova ZN criada: ", sessions[j].name, " | Canal formado em ", actual_session_bars, " velas | Válida até: ", TimeToString(next_session_start));
                }
                else if (topo > fundo)
                {
                    Print("🟡 Canal ignorado: ", sessions[j].name, " | Amplitude (", (topo - fundo) / _Point, " pontos) é menor que o mínimo (", pontosMinimosCR, " pontos)");
                }
            }
        }
    }

    // redesenhar ZNs ativas dentro do modo de exibicao
    for(int z = 0; z < activeZNCount; z++)
    {
        datetime displayLimit = GetDisplayLimitTime(modoExibicao, mesesParaTras);
        if(activeZNs[z].startTime < displayLimit) continue;

        int session_start_index = -1;
        for(int idx = 0; idx < rates_total; idx++) if(time[idx] == activeZNs[z].startTime) { session_start_index = idx; break; }
        if(session_start_index < 0) continue;

        datetime final_time_for_lines = activeZNs[z].endTime;
        if(final_time_for_lines == 0) continue;

        for(int j=0; j<8; j++)
        {
            if(sessions[j].name == activeZNs[z].sessionName)
            {
                MarcarSessao(rates_total, prev_calculated, time, open, high, low, close,
                             session_start_index, sessions[j].minBars, sessions[j].maxBars,
                             activeZNs[z].sessionPrefix, activeZNs[z].sessionName,
                             sessions[j].topoColor, sessions[j].fundoColor, useWicksForCR,
                             activeZNs[z].znNameUp, activeZNs[z].znNameDown, final_time_for_lines);
                break;
            }
        }
    }

    // Lógica de alerta
    int currentBar = rates_total - 1;
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

            if(high[currentBar] >= activeZNs[z].znUpPrice - tolerance && low[currentBar] <= activeZNs[z].znUpPrice + tolerance) triggeredUp = true;
            if(low[currentBar] <= activeZNs[z].znDownPrice + tolerance && high[currentBar] >= activeZNs[z].znDownPrice - tolerance) triggeredDown = true;

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

    ChartRedraw();
    return(rates_total);
}

//============================
// Funções auxiliares implementadas
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
    if(ObjectFind(0, fullName) < 0)
    {
        if(!ObjectCreate(0, fullName, OBJ_TREND, 0, t1, p1, t2, p2))
        {
            Print("🔴 Falha ao criar objeto ", fullName, ": ", GetLastError());
            return;
        }
    }
    ObjectSetInteger(0, fullName, OBJPROP_COLOR, cor);
    ObjectSetInteger(0, fullName, OBJPROP_STYLE, estilo);
    ObjectSetInteger(0, fullName, OBJPROP_WIDTH, espessura);
    ObjectSetInteger(0, fullName, OBJPROP_RAY, raio);
    ObjectSetInteger(0, fullName, OBJPROP_SELECTABLE, false);
    ObjectSetInteger(0, fullName, OBJPROP_BACK, false);
}

void AdicionarTextoPersonalizado(string nome, datetime tempo, double preco, string texto, color cor, int fontSize, int anchor)
{
    string fullName = INDICATOR_PREFIX + nome;
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
    hour = StringToInteger(parts[0]);
    minute = StringToInteger(parts[1]);
    return (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59);
}

datetime FindNextSessionTime(datetime currentTime, SessionData &sessions[], int currentIndex)
{
    datetime nextTime = 0;
    for(int i = 0; i < 8; i++)
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
        for(int i = 0; i < 8; i++)
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
    for(int i = 0; i < 8; i++)
    {
        if(sessions[i].enable)
        {
            datetime sessionStart = GetSessionStartTime(currentTime, sessions[i].hour, sessions[i].minute);
            datetime sessionEnd = sessionStart + (sessions[i].maxBars * PeriodSeconds(_Period));
            if(currentTime >= sessionStart && currentTime < sessionEnd)
            {
                if(activeName == "" || sessionStart > activeStart) { activeName = sessions[i].name; activeStart = sessionStart; }
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
        if((inicio + i) >= rates_total) { actual_bars_used = i; break; }
        if(use_wicks_for_cr) { if(high[inicio+i] > topo) topo = high[inicio+i]; if(low[inicio+i] < fundo) fundo = low[inicio+i]; }
        else { double max_candle = MathMax(open[inicio+i], close[inicio+i]); double min_candle = MathMin(open[inicio+i], close[inicio+i]); if(max_candle > topo) topo = max_candle; if(min_candle < fundo) fundo = min_candle; }

        if((i+1) >= min_session_bars && (topo - fundo) / _Point >= pontosMinimosCR) { actual_bars_used = i + 1; break; }
    }

    double rangeHeight = topo - fundo;
    int pontosCR = (int)MathRound(rangeHeight / _Point);
    if(pontosCR < pontosMinimosCR) return;

    datetime t1_lines = time[inicio];
    MqlDateTime tm_end_of_day; TimeToStruct(t1_lines, tm_end_of_day); tm_end_of_day.hour=23; tm_end_of_day.min=59; tm_end_of_day.sec=59;
    datetime end_of_day = StructToTime(tm_end_of_day);
    datetime final_time_capped = MathMin(final_time_for_lines, end_of_day);
    double vOffset = TextVerticalOffsetPips * _Point;

    MqlDateTime tm_inicio; TimeToStruct(time[inicio], tm_inicio);
    long diaUnicoID = (long)tm_inicio.year*10000000000 + (long)tm_inicio.mon*100000000 + (long)tm_inicio.day*1000000 + (long)tm_inicio.hour*10000 + (long)tm_inicio.min*100 + (long)tm_inicio.sec;
    int pontosZN = pontosCR * 2;

    CriarLinhaPersonalizada(prefixoObjeto + "CR_TOPO" + IntegerToString((int)diaUnicoID), t1_lines, topo, final_time_capped, topo, corTopo, estiloLinhaCR, espessuraCR);
    CriarLinhaPersonalizada(prefixoObjeto + "CR_FUNDO" + IntegerToString((int)diaUnicoID), t1_lines, fundo, final_time_capped, fundo, corFundo, estiloLinhaCR, espessuraCR);

    if(mostrarAreaCR) DesenharAreaCR(t1_lines, final_time_capped, topo, fundo, prefixoObjeto, diaUnicoID);

    datetime label_time = time[MathMin(inicio + 20, rates_total - 1)];
    if(label_time > final_time_capped) label_time = final_time_capped;

    AdicionarTextoPersonalizado(prefixoObjeto + "LABEL_CR" + IntegerToString((int)diaUnicoID), label_time, (topo+fundo)/2,
                                 sessionLabelText + " (" + IntegerToString(actual_bars_used) + " velas) (CR: " + IntegerToString(pontosCR) + " pips)", CorTextoSessao, fontSizeSessao, ANCHOR_CENTER);

    double znUpPrice = topo + rangeHeight;
    string nomeZNUp = prefixoObjeto + "REPL_UP_1" + IntegerToString((int)diaUnicoID);
    string labelZNUp = prefixoObjeto + "LABEL_UP_1" + IntegerToString((int)diaUnicoID);

    CriarLinhaPersonalizada(nomeZNUp, t1_lines, znUpPrice, final_time_capped, znUpPrice, corZN_Up, estiloLinhaZN, espessuraZN);
    AdicionarTextoPersonalizado(labelZNUp, label_time, znUpPrice + vOffset,
                                 znNameUp + ": (" + IntegerToString(pontosZN) + " pontos) (" + DoubleToString(znUpPrice, _Digits) + ")", CorTextoZN, fontSizeZN, ANCHOR_LEFT);

    double znDownPrice = fundo - rangeHeight;
    string nomeZNDown = prefixoObjeto + "REPL_DOWN_1" + IntegerToString((int)diaUnicoID);
    string labelZNDown = prefixoObjeto + "LABEL_DOWN_1" + IntegerToString((int)diaUnicoID);

    CriarLinhaPersonalizada(nomeZNDown, t1_lines, znDownPrice, final_time_capped, znDownPrice, corZN_Down, estiloLinhaZN, espessuraZN);
    AdicionarTextoPersonalizado(labelZNDown, label_time, znDownPrice - vOffset,
                                 znNameDown + ": (" + IntegerToString(pontosZN) + " pontos) (" + DoubleToString(znDownPrice, _Digits) + ")", CorTextoZN, fontSizeZN, ANCHOR_LEFT);

    double takeDistance = rangeHeight + rangeHeight;
    for(int i = 1; i <= 10; i++)
    {
        double takeUpPrice = znUpPrice + (takeDistance * i);
        string takeUpName = prefixoObjeto + "TP_COMPRA" + IntegerToString(i) + "_" + IntegerToString((int)diaUnicoID);
        string takeUpLabel = prefixoObjeto + "LABEL_COMPRA" + IntegerToString(i) + "_" + IntegerToString((int)diaUnicoID);
        string takeTextUp = "TP (Compra) " + IntegerToString(i);
        color corLinha = GetTakeColor(i);

        CriarLinhaPersonalizada(takeUpName, t1_lines, takeUpPrice, final_time_capped, takeUpPrice, corLinha, estiloLinhaTake, espessuraTake);
        AdicionarTextoPersonalizado(takeUpLabel, label_time, takeUpPrice + vOffset, takeTextUp + " (" + DoubleToString(takeUpPrice, _Digits) + ")", CorTextoTake, fontSizeTake, ANCHOR_LEFT);

        double takeDownPrice = znDownPrice - (takeDistance * i);
        string takeDownName = prefixoObjeto + "TP_VENDA" + IntegerToString(i) + "_" + IntegerToString((int)diaUnicoID);
        string takeDownLabel = prefixoObjeto + "LABEL_VENDA" + IntegerToString(i) + "_" + IntegerToString((int)diaUnicoID);
        string takeTextDown = "TP (Venda) " + IntegerToString(i);

        CriarLinhaPersonalizada(takeDownName, t1_lines, takeDownPrice, final_time_capped, takeDownPrice, corLinha, estiloLinhaTake, espessuraTake);
        AdicionarTextoPersonalizado(takeDownLabel, label_time, takeDownPrice - vOffset, takeTextDown + " (" + DoubleToString(takeDownPrice, _Digits) + ")", CorTextoTake, fontSizeTake, ANCHOR_LEFT);
    }
}
