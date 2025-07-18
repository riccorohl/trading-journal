//+------------------------------------------------------------------+
//| TradingJournalEA_MT4.mq4                                         |
//| Trading Journal Integration EA for MT4                          |
//| Automatically sends trade data to your SaaS trading journal     |
//+------------------------------------------------------------------+

#property copyright "Your Trading Journal"
#property link      "https://your-domain.com"
#property version   "1.00"
#property description "Automatically captures and sends trade data to your trading journal"

//--- Input parameters
extern string API_URL = "https://us-central1-your-project-id.cloudfunctions.net/receiveEATrade"; // Your API endpoint
extern string API_KEY = "";                    // Your generated API key
extern string USER_ID = "";                    // Your user ID (optional)
extern bool   ENABLE_LOGGING = true;           // Enable detailed logging
extern int    MAX_RETRIES = 3;                 // Maximum retry attempts for failed requests

//--- Global variables
bool g_initialized = false;
string g_account_number;
int g_last_total_orders = 0;
int g_last_total_history = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   // Validate required parameters
   if(StringLen(API_URL) == 0)
   {
      Alert("Trading Journal EA: API_URL parameter is required!");
      return(INIT_PARAMETERS_INCORRECT);
   }
   
   if(StringLen(API_KEY) == 0)
   {
      Alert("Trading Journal EA: API_KEY parameter is required!");
      return(INIT_PARAMETERS_INCORRECT);
   }
   
   // Get account information
   g_account_number = IntegerToString(AccountNumber());
   
   // Initialize counters
   g_last_total_orders = OrdersTotal();
   g_last_total_history = OrdersHistoryTotal();
   
   if(ENABLE_LOGGING)
   {
      Print("Trading Journal EA initialized successfully");
      Print("Account: ", g_account_number);
      Print("API URL: ", API_URL);
      Print("Current orders: ", g_last_total_orders);
      Print("History orders: ", g_last_total_history);
   }
   
   g_initialized = true;
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   if(ENABLE_LOGGING)
      Print("Trading Journal EA deinitialized. Reason: ", reason);
}

//+------------------------------------------------------------------+
//| Expert tick function (monitors for trade changes)               |
//+------------------------------------------------------------------+
void OnTick()
{
   if(!g_initialized)
      return;
      
   // Check for new orders (positions opened)
   int current_orders = OrdersTotal();
   if(current_orders > g_last_total_orders)
   {
      CheckForNewOrders();
   }
   g_last_total_orders = current_orders;
   
   // Check for closed orders (positions closed)
   int current_history = OrdersHistoryTotal();
   if(current_history > g_last_total_history)
   {
      CheckForClosedOrders();
   }
   g_last_total_history = current_history;
}

//+------------------------------------------------------------------+
//| Check for newly opened orders                                   |
//+------------------------------------------------------------------+
void CheckForNewOrders()
{
   for(int i = 0; i < OrdersTotal(); i++)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         // Only process market orders (buy/sell)
         if(OrderType() == OP_BUY || OrderType() == OP_SELL)
         {
            // Check if this is a recently opened order (within last minute)
            if(TimeCurrent() - OrderOpenTime() < 60)
            {
               SendOrderData(true, false); // is_opening = true, is_closing = false
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Check for recently closed orders                                |
//+------------------------------------------------------------------+
void CheckForClosedOrders()
{
   // Check recent history for closed orders
   int total_history = OrdersHistoryTotal();
   
   for(int i = total_history - 1; i >= MathMax(0, total_history - 10); i--)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_HISTORY))
      {
         // Only process market orders that were closed recently
         if((OrderType() == OP_BUY || OrderType() == OP_SELL) && 
            TimeCurrent() - OrderCloseTime() < 60)
         {
            SendOrderData(false, true); // is_opening = false, is_closing = true
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Send order data to API                                          |
//+------------------------------------------------------------------+
void SendOrderData(bool is_opening, bool is_closing)
{
   // Extract order information
   string symbol = OrderSymbol();
   int order_type = OrderType();
   double volume = OrderLots();
   double open_price = OrderOpenPrice();
   double close_price = OrderClosePrice();
   datetime open_time = OrderOpenTime();
   datetime close_time = OrderCloseTime();
   double profit = OrderProfit();
   double swap = OrderSwap();
   double commission = OrderCommission();
   string comment = OrderComment();
   int ticket = OrderTicket();
   int magic = OrderMagicNumber();
   double stop_loss = OrderStopLoss();
   double take_profit = OrderTakeProfit();
   
   // Prepare JSON data
   string json_data = CreateTradeJSON(symbol, order_type, volume, open_price, close_price,
                                     open_time, close_time, profit, swap, commission,
                                     comment, ticket, magic, stop_loss, take_profit,
                                     is_opening, is_closing);
   
   if(ENABLE_LOGGING)
   {
      Print("Sending trade data: ", json_data);
   }
   
   // Prepare HTTP headers
   string headers = "Content-Type: application/json\r\n";
   headers += "Authorization: Bearer " + API_KEY + "\r\n";
   headers += "User-Agent: MetaTrader4-EA/1.0\r\n";
   
   char post_data[];
   StringToCharArray(json_data, post_data, 0, StringLen(json_data));
   
   char result_data[];
   string result_headers;
   
   // Attempt to send with retries
   int attempts = 0;
   int response_code = -1;
   
   while(attempts < MAX_RETRIES && response_code != 200 && response_code != 201)
   {
      attempts++;
      
      response_code = WebRequest("POST", API_URL, headers, 5000, post_data, result_data, result_headers);
      
      if(response_code == 200 || response_code == 201)
      {
         string response = CharArrayToString(result_data);
         if(ENABLE_LOGGING)
         {
            Print("Trade data sent successfully. Response: ", response);
         }
         break;
      }
      else
      {
         if(ENABLE_LOGGING)
         {
            Print("Failed to send trade data. Attempt ", attempts, "/", MAX_RETRIES, 
                  ". Response code: ", response_code);
            if(ArraySize(result_data) > 0)
            {
               string error_response = CharArrayToString(result_data);
               Print("Error response: ", error_response);
            }
         }
         
         if(attempts < MAX_RETRIES)
         {
            Sleep(1000 * attempts); // Progressive delay
         }
      }
   }
   
   if(response_code != 200 && response_code != 201)
   {
      Print("ERROR: Failed to send trade data after ", MAX_RETRIES, " attempts. Last response code: ", response_code);
   }
}

//+------------------------------------------------------------------+
//| Create JSON string for trade data                               |
//+------------------------------------------------------------------+
string CreateTradeJSON(string symbol, int order_type, double volume,
                       double open_price, double close_price,
                       datetime open_time, datetime close_time,
                       double profit, double swap, double commission,
                       string comment, int ticket, int magic,
                       double stop_loss, double take_profit,
                       bool is_opening, bool is_closing)
{
   string trade_type = (order_type == OP_BUY) ? "buy" : "sell";
   string open_time_str = TimeToStr(open_time, TIME_DATE | TIME_MINUTES);
   string close_time_str = "";
   
   if(is_closing && close_time > 0)
   {
      close_time_str = TimeToStr(close_time, TIME_DATE | TIME_MINUTES);
   }
   
   string json = "{";
   json += "\"accountNumber\": \"" + g_account_number + "\",";
   json += "\"symbol\": \"" + symbol + "\",";
   json += "\"type\": \"" + trade_type + "\",";
   json += "\"volume\": " + DoubleToStr(volume, 2) + ",";
   json += "\"openPrice\": " + DoubleToStr(open_price, Digits) + ",";
   
   if(is_closing)
   {
      json += "\"closePrice\": " + DoubleToStr(close_price, Digits) + ",";
      json += "\"closeTime\": \"" + close_time_str + "\",";
   }
   
   json += "\"openTime\": \"" + open_time_str + "\",";
   json += "\"profit\": " + DoubleToStr(profit, 2) + ",";
   json += "\"swap\": " + DoubleToStr(swap, 2) + ",";
   json += "\"commission\": " + DoubleToStr(commission, 2) + ",";
   json += "\"comment\": \"" + comment + "\",";
   json += "\"positionId\": \"" + IntegerToString(ticket) + "\",";
   json += "\"isOpen\": " + (is_opening ? "true" : "false") + ",";
   json += "\"magicNumber\": " + IntegerToString(magic) + ",";
   json += "\"stopLoss\": " + DoubleToStr(stop_loss, Digits) + ",";
   json += "\"takeProfit\": " + DoubleToStr(take_profit, Digits);
   json += "}";
   
   return json;
}

//+------------------------------------------------------------------+
//| Get string representation of order type                         |
//+------------------------------------------------------------------+
string OrderTypeToString(int order_type)
{
   switch(order_type)
   {
      case OP_BUY: return "BUY";
      case OP_SELL: return "SELL";
      case OP_BUYLIMIT: return "BUY LIMIT";
      case OP_SELLLIMIT: return "SELL LIMIT";
      case OP_BUYSTOP: return "BUY STOP";
      case OP_SELLSTOP: return "SELL STOP";
      default: return "UNKNOWN";
   }
}