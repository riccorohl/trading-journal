//+------------------------------------------------------------------+
//| TradingJournalEA_MT5.mq5                                         |
//| Trading Journal Integration EA for MT5                          |
//| Automatically sends trade data to your SaaS trading journal     |
//+------------------------------------------------------------------+

#property copyright "Your Trading Journal"
#property link      "https://your-domain.com"
#property version   "1.00"
#property description "Automatically captures and sends trade data to your trading journal"

//--- Input parameters
input string API_URL = "https://us-central1-your-project-id.cloudfunctions.net/receiveEATrade"; // Your API endpoint
input string API_KEY = "";                    // Your generated API key
input string USER_ID = "";                    // Your user ID (optional)
input bool   ENABLE_LOGGING = true;           // Enable detailed logging
input int    MAX_RETRIES = 3;                 // Maximum retry attempts for failed requests

//--- Global variables
bool g_initialized = false;
string g_account_number;

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
   g_account_number = IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN));
   
   if(ENABLE_LOGGING)
   {
      Print("Trading Journal EA initialized successfully");
      Print("Account: ", g_account_number);
      Print("API URL: ", API_URL);
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
//| Trade transaction event handler                                 |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction& trans,
                       const MqlTradeRequest& request,
                       const MqlTradeResult& result)
{
   if(!g_initialized)
      return;
      
   // Only process deal transactions (actual trades)
   if(trans.type != TRADE_TRANSACTION_DEAL_ADD)
      return;
      
   // Get deal information
   if(!HistoryDealSelect(trans.deal))
   {
      if(ENABLE_LOGGING)
         Print("Failed to select deal: ", trans.deal);
      return;
   }
   
   // Extract deal details
   long deal_ticket = trans.deal;
   string symbol = trans.symbol;
   ENUM_DEAL_TYPE deal_type = (ENUM_DEAL_TYPE)HistoryDealGetInteger(deal_ticket, DEAL_TYPE);
   
   // Only process buy and sell deals
   if(deal_type != DEAL_TYPE_BUY && deal_type != DEAL_TYPE_SELL)
      return;
      
   double volume = HistoryDealGetDouble(deal_ticket, DEAL_VOLUME);
   double price = HistoryDealGetDouble(deal_ticket, DEAL_PRICE);
   double profit = HistoryDealGetDouble(deal_ticket, DEAL_PROFIT);
   double swap = HistoryDealGetDouble(deal_ticket, DEAL_SWAP);
   double commission = HistoryDealGetDouble(deal_ticket, DEAL_COMMISSION);
   datetime deal_time = (datetime)HistoryDealGetInteger(deal_ticket, DEAL_TIME);
   long position_id = HistoryDealGetInteger(deal_ticket, DEAL_POSITION_ID);
   string comment = HistoryDealGetString(deal_ticket, DEAL_COMMENT);
   long magic = HistoryDealGetInteger(deal_ticket, DEAL_MAGIC);
   
   // Determine if this is position opening or closing
   bool is_opening = false;
   bool is_closing = false;
   
   // Check position status
   if(PositionSelectByTicket(position_id))
   {
      // Position still exists, this might be opening or partial close
      double position_volume = PositionGetDouble(POSITION_VOLUME);
      if(position_volume > 0)
         is_opening = true;
   }
   else
   {
      // Position doesn't exist anymore, this was a close
      is_closing = true;
   }
   
   // If we can't determine, check if this is an entry deal
   if(!is_opening && !is_closing)
   {
      ENUM_DEAL_ENTRY deal_entry = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(deal_ticket, DEAL_ENTRY);
      is_opening = (deal_entry == DEAL_ENTRY_IN);
      is_closing = (deal_entry == DEAL_ENTRY_OUT);
   }
   
   // Send trade data to API
   if(is_opening || is_closing)
   {
      SendTradeData(symbol, deal_type, volume, price, profit, swap, commission, 
                    deal_time, position_id, comment, magic, is_opening, is_closing);
   }
}

//+------------------------------------------------------------------+
//| Send trade data to API                                          |
//+------------------------------------------------------------------+
void SendTradeData(string symbol, ENUM_DEAL_TYPE deal_type, double volume, 
                   double price, double profit, double swap, double commission,
                   datetime deal_time, long position_id, string comment, 
                   long magic, bool is_opening, bool is_closing)
{
   // Prepare JSON data
   string json_data = CreateTradeJSON(symbol, deal_type, volume, price, profit, 
                                     swap, commission, deal_time, position_id, 
                                     comment, magic, is_opening, is_closing);
   
   if(ENABLE_LOGGING)
   {
      Print("Sending trade data: ", json_data);
   }
   
   // Prepare HTTP headers
   string headers = "Content-Type: application/json\r\n";
   headers += "Authorization: Bearer " + API_KEY + "\r\n";
   headers += "User-Agent: MetaTrader5-EA/1.0\r\n";
   
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
string CreateTradeJSON(string symbol, ENUM_DEAL_TYPE deal_type, double volume,
                       double price, double profit, double swap, double commission,
                       datetime deal_time, long position_id, string comment,
                       long magic, bool is_opening, bool is_closing)
{
   string trade_type = (deal_type == DEAL_TYPE_BUY) ? "buy" : "sell";
   string time_str = TimeToString(deal_time, TIME_DATE | TIME_MINUTES);
   
   // Get position details if still open
   double stop_loss = 0;
   double take_profit = 0;
   double close_price = 0;
   string close_time = "";
   
   if(PositionSelectByTicket(position_id))
   {
      stop_loss = PositionGetDouble(POSITION_SL);
      take_profit = PositionGetDouble(POSITION_TP);
   }
   
   if(is_closing)
   {
      close_price = price;
      close_time = time_str;
   }
   
   string json = "{";
   json += "\"accountNumber\": \"" + g_account_number + "\",";
   json += "\"symbol\": \"" + symbol + "\",";
   json += "\"type\": \"" + trade_type + "\",";
   json += "\"volume\": " + DoubleToString(volume, 2) + ",";
   json += "\"openPrice\": " + DoubleToString(price, _Digits) + ",";
   
   if(is_closing)
   {
      json += "\"closePrice\": " + DoubleToString(close_price, _Digits) + ",";
      json += "\"closeTime\": \"" + close_time + "\",";
   }
   
   json += "\"openTime\": \"" + time_str + "\",";
   json += "\"profit\": " + DoubleToString(profit, 2) + ",";
   json += "\"swap\": " + DoubleToString(swap, 2) + ",";
   json += "\"commission\": " + DoubleToString(commission, 2) + ",";
   json += "\"comment\": \"" + comment + "\",";
   json += "\"positionId\": \"" + IntegerToString(position_id) + "\",";
   json += "\"isOpen\": " + (is_opening ? "true" : "false") + ",";
   json += "\"magicNumber\": " + IntegerToString(magic) + ",";
   json += "\"stopLoss\": " + DoubleToString(stop_loss, _Digits) + ",";
   json += "\"takeProfit\": " + DoubleToString(take_profit, _Digits);
   json += "}";
   
   return json;
}

//+------------------------------------------------------------------+
//| Get string representation of deal type                          |
//+------------------------------------------------------------------+
string DealTypeToString(ENUM_DEAL_TYPE deal_type)
{
   switch(deal_type)
   {
      case DEAL_TYPE_BUY: return "BUY";
      case DEAL_TYPE_SELL: return "SELL";
      default: return "UNKNOWN";
   }
}