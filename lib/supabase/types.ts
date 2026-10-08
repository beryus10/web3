export type UserRole = "user" | "admin";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  referred_by: string | null;
  role: UserRole;
  balance: number;
  active_investment: number;
  profit_today: number;
  created_at: string;
};

export type DepositRequest = {
  id: string;
  user_id: string;
  amount: number;
  network: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
};

export type WithdrawalRequest = {
  id: string;
  user_id: string;
  amount: number;
  network: string;
  recipient_address: string;
  currency: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id" | "email" | "full_name">;
        Update: Partial<Profile>;
        Relationships: [];
      };
      deposit_requests: {
        Row: DepositRequest;
        Insert: Pick<DepositRequest, "user_id" | "amount" | "network">;
        Update: Partial<Pick<DepositRequest, "status" | "reviewed_at">>;
        Relationships: [];
      };
      withdrawal_requests: {
        Row: WithdrawalRequest;
        Insert: Pick<WithdrawalRequest, "user_id" | "amount" | "network" | "recipient_address" | "currency">;
        Update: Partial<Pick<WithdrawalRequest, "status" | "reviewed_at">>;
        Relationships: [];
      };
      balance_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: "deposit" | "withdrawal" | "adjustment";
          amount: number;
          status: "pending" | "completed" | "rejected";
          description: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["balance_transactions"]["Row"], "id" | "created_at">;
        Update: never;
        Relationships: [];
      };
      support_messages: {
        Row: {
          id: string;
          user_id: string;
          sender_role: "user" | "admin";
          body: string;
          created_at: string;
        };
        Insert: Pick<Database["public"]["Tables"]["support_messages"]["Row"], "user_id" | "sender_role" | "body">;
        Update: never;
        Relationships: [];
      };
    };
    Functions: {
      adjust_user_balance: {
        Args: { target_user_id: string; amount_delta: number; note: string };
        Returns: void;
      };
      approve_deposit: {
        Args: { request_id: string };
        Returns: void;
      };
      reject_deposit: {
        Args: { request_id: string };
        Returns: void;
      };
      review_withdrawal: {
        Args: { request_id: string; decision: "approved" | "rejected" };
        Returns: void;
      };
    };
    Views: Record<string, never>;
    Enums: {
      user_role: UserRole;
      deposit_status: "pending" | "approved" | "rejected";
      withdrawal_status: "pending" | "approved" | "rejected";
      transaction_type: "deposit" | "withdrawal" | "adjustment";
      transaction_status: "pending" | "completed" | "rejected";
    };
    CompositeTypes: Record<string, never>;
  };
};
