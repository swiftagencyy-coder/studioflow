export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type TableDefinition<Row, Insert, Update> = {
  Insert: Insert;
  Relationships: [];
  Row: Row;
  Update: Update;
};

type AppRole = "agency_owner" | "team_member" | "client";
type ClientStatus = "active" | "archived";
type ProjectStatus =
  | "lead"
  | "onboarding"
  | "in_progress"
  | "waiting_on_client"
  | "review"
  | "approved"
  | "completed";
type FileCategory =
  | "logo"
  | "brand_asset"
  | "document"
  | "deliverable"
  | "reference"
  | "onboarding_asset";
type FileVisibility = "internal" | "client";
type ProposalStatus = "draft" | "sent" | "accepted" | "rejected";
type ApprovalStatus = "pending" | "approved" | "changes_requested";
type RevisionPriority = "low" | "medium" | "high" | "urgent";
type RevisionStatus = "open" | "in_review" | "in_progress" | "resolved";
type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
type ActivityAction =
  | "client_created"
  | "client_updated"
  | "project_created"
  | "project_updated"
  | "onboarding_requested"
  | "onboarding_submitted"
  | "file_uploaded"
  | "proposal_created"
  | "proposal_sent"
  | "proposal_accepted"
  | "proposal_rejected"
  | "approval_requested"
  | "approval_approved"
  | "approval_changes_requested"
  | "revision_submitted"
  | "revision_updated"
  | "invoice_created"
  | "invoice_updated";
type ActivityVisibility = "internal" | "client";

export type Database = {
  public: {
    CompositeTypes: {
      [_ in never]: never;
    };
    Enums: {
      activity_action: ActivityAction;
      activity_visibility: ActivityVisibility;
      app_role: AppRole;
      approval_status: ApprovalStatus;
      client_status: ClientStatus;
      file_category: FileCategory;
      file_visibility: FileVisibility;
      invoice_status: InvoiceStatus;
      project_status: ProjectStatus;
      proposal_status: ProposalStatus;
      revision_priority: RevisionPriority;
      revision_status: RevisionStatus;
    };
    Functions: {
      bootstrap_agency_owner: {
        Args: { input_agency_name: string };
        Returns: string;
      };
      respond_to_approval: {
        Args: { decision: ApprovalStatus; response_body?: string | null; target_approval_id: string };
        Returns: Database["public"]["Tables"]["approval_requests"]["Row"];
      };
      respond_to_proposal: {
        Args: { decision: ProposalStatus; response_body?: string | null; target_proposal_id: string };
        Returns: Database["public"]["Tables"]["proposals"]["Row"];
      };
    };
    Tables: {
      activity_logs: TableDefinition<
        {
          action: ActivityAction;
          actor_name: string;
          actor_user_id: string | null;
          client_id: string | null;
          created_at: string;
          entity_id: string;
          entity_type: string;
          id: string;
          message: string;
          metadata: Json;
          project_id: string | null;
          visibility: ActivityVisibility;
        },
        {
          action: ActivityAction;
          actor_name: string;
          actor_user_id?: string | null;
          client_id?: string | null;
          created_at?: string;
          entity_id: string;
          entity_type: string;
          id?: string;
          message: string;
          metadata?: Json;
          project_id?: string | null;
          visibility?: ActivityVisibility;
        },
        Partial<{
          action: ActivityAction;
          actor_name: string;
          actor_user_id: string | null;
          client_id: string | null;
          created_at: string;
          entity_id: string;
          entity_type: string;
          id: string;
          message: string;
          metadata: Json;
          project_id: string | null;
          visibility: ActivityVisibility;
        }>
      >;
      agencies: TableDefinition<
        {
          archived_at: string | null;
          created_at: string;
          id: string;
          name: string;
          owner_user_id: string | null;
          slug: string;
          updated_at: string;
        },
        {
          archived_at?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          owner_user_id?: string | null;
          slug: string;
          updated_at?: string;
        },
        Partial<{
          archived_at: string | null;
          created_at: string;
          id: string;
          name: string;
          owner_user_id: string | null;
          slug: string;
          updated_at: string;
        }>
      >;
      agency_members: TableDefinition<
        {
          agency_id: string;
          created_at: string;
          id: string;
          is_active: boolean;
          role: AppRole;
          title: string | null;
          user_id: string;
        },
        {
          agency_id: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          role: "agency_owner" | "team_member";
          title?: string | null;
          user_id: string;
        },
        Partial<{
          agency_id: string;
          created_at: string;
          id: string;
          is_active: boolean;
          role: "agency_owner" | "team_member";
          title: string | null;
          user_id: string;
        }>
      >;
      approval_requests: TableDefinition<
        {
          created_at: string;
          deliverable_file_id: string | null;
          id: string;
          message: string | null;
          project_id: string;
          requested_at: string;
          requested_by: string | null;
          requested_by_name: string;
          responded_at: string | null;
          response_message: string | null;
          status: ApprovalStatus;
          title: string;
          updated_at: string;
        },
        {
          created_at?: string;
          deliverable_file_id?: string | null;
          id?: string;
          message?: string | null;
          project_id: string;
          requested_at?: string;
          requested_by?: string | null;
          requested_by_name: string;
          responded_at?: string | null;
          response_message?: string | null;
          status?: ApprovalStatus;
          title: string;
          updated_at?: string;
        },
        Partial<{
          created_at: string;
          deliverable_file_id: string | null;
          id: string;
          message: string | null;
          project_id: string;
          requested_at: string;
          requested_by: string | null;
          requested_by_name: string;
          responded_at: string | null;
          response_message: string | null;
          status: ApprovalStatus;
          title: string;
          updated_at: string;
        }>
      >;
      client_private_details: TableDefinition<
        {
          client_id: string;
          created_at: string;
          notes: string | null;
          updated_at: string;
        },
        {
          client_id: string;
          created_at?: string;
          notes?: string | null;
          updated_at?: string;
        },
        Partial<{
          client_id: string;
          created_at: string;
          notes: string | null;
          updated_at: string;
        }>
      >;
      client_users: TableDefinition<
        {
          client_id: string;
          created_at: string;
          id: string;
          is_primary: boolean;
          title: string | null;
          user_id: string;
        },
        {
          client_id: string;
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          title?: string | null;
          user_id: string;
        },
        Partial<{
          client_id: string;
          created_at: string;
          id: string;
          is_primary: boolean;
          title: string | null;
          user_id: string;
        }>
      >;
      clients: TableDefinition<
        {
          agency_id: string;
          archived_at: string | null;
          contact_name: string;
          created_at: string;
          created_by: string | null;
          email: string;
          id: string;
          name: string;
          phone: string | null;
          status: ClientStatus;
          tags: string[];
          updated_at: string;
        },
        {
          agency_id: string;
          archived_at?: string | null;
          contact_name: string;
          created_at?: string;
          created_by?: string | null;
          email: string;
          id?: string;
          name: string;
          phone?: string | null;
          status?: ClientStatus;
          tags?: string[];
          updated_at?: string;
        },
        Partial<{
          agency_id: string;
          archived_at: string | null;
          contact_name: string;
          created_at: string;
          created_by: string | null;
          email: string;
          id: string;
          name: string;
          phone: string | null;
          status: ClientStatus;
          tags: string[];
          updated_at: string;
        }>
      >;
      invoices: TableDefinition<
        {
          amount: number;
          created_at: string;
          created_by: string | null;
          due_date: string;
          id: string;
          invoice_number: string;
          issued_at: string | null;
          note: string | null;
          paid_at: string | null;
          project_id: string;
          status: InvoiceStatus;
          updated_at: string;
        },
        {
          amount: number;
          created_at?: string;
          created_by?: string | null;
          due_date: string;
          id?: string;
          invoice_number: string;
          issued_at?: string | null;
          note?: string | null;
          paid_at?: string | null;
          project_id: string;
          status?: InvoiceStatus;
          updated_at?: string;
        },
        Partial<{
          amount: number;
          created_at: string;
          created_by: string | null;
          due_date: string;
          id: string;
          invoice_number: string;
          issued_at: string | null;
          note: string | null;
          paid_at: string | null;
          project_id: string;
          status: InvoiceStatus;
          updated_at: string;
        }>
      >;
      onboarding_submissions: TableDefinition<
        {
          brand_colors: string[];
          business_description: string;
          competitor_examples: string[];
          created_at: string;
          deadlines: string | null;
          design_style_preferences: string | null;
          extra_notes: string | null;
          font_preferences: string | null;
          id: string;
          project_id: string;
          required_pages: string | null;
          submitted_by: string | null;
          target_audience: string;
          updated_at: string;
        },
        {
          brand_colors?: string[];
          business_description: string;
          competitor_examples?: string[];
          created_at?: string;
          deadlines?: string | null;
          design_style_preferences?: string | null;
          extra_notes?: string | null;
          font_preferences?: string | null;
          id?: string;
          project_id: string;
          required_pages?: string | null;
          submitted_by?: string | null;
          target_audience: string;
          updated_at?: string;
        },
        Partial<{
          brand_colors: string[];
          business_description: string;
          competitor_examples: string[];
          created_at: string;
          deadlines: string | null;
          design_style_preferences: string | null;
          extra_notes: string | null;
          font_preferences: string | null;
          id: string;
          project_id: string;
          required_pages: string | null;
          submitted_by: string | null;
          target_audience: string;
          updated_at: string;
        }>
      >;
      profiles: TableDefinition<
        {
          avatar_url: string | null;
          created_at: string;
          default_role: AppRole;
          email: string;
          full_name: string;
          id: string;
          updated_at: string;
        },
        {
          avatar_url?: string | null;
          created_at?: string;
          default_role?: AppRole;
          email: string;
          full_name: string;
          id: string;
          updated_at?: string;
        },
        Partial<{
          avatar_url: string | null;
          created_at: string;
          default_role: AppRole;
          email: string;
          full_name: string;
          id: string;
          updated_at: string;
        }>
      >;
      project_private_details: TableDefinition<
        {
          created_at: string;
          internal_notes: string | null;
          project_id: string;
          updated_at: string;
        },
        {
          created_at?: string;
          internal_notes?: string | null;
          project_id: string;
          updated_at?: string;
        },
        Partial<{
          created_at: string;
          internal_notes: string | null;
          project_id: string;
          updated_at: string;
        }>
      >;
      projects: TableDefinition<
        {
          agency_id: string;
          archived_at: string | null;
          client_id: string;
          created_at: string;
          created_by: string | null;
          description: string | null;
          due_date: string | null;
          id: string;
          name: string;
          onboarding_completed_at: string | null;
          onboarding_requested_at: string | null;
          portal_summary: string | null;
          service_type: string;
          status: ProjectStatus;
          updated_at: string;
        },
        {
          agency_id: string;
          archived_at?: string | null;
          client_id: string;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          name: string;
          onboarding_completed_at?: string | null;
          onboarding_requested_at?: string | null;
          portal_summary?: string | null;
          service_type: string;
          status?: ProjectStatus;
          updated_at?: string;
        },
        Partial<{
          agency_id: string;
          archived_at: string | null;
          client_id: string;
          created_at: string;
          created_by: string | null;
          description: string | null;
          due_date: string | null;
          id: string;
          name: string;
          onboarding_completed_at: string | null;
          onboarding_requested_at: string | null;
          portal_summary: string | null;
          service_type: string;
          status: ProjectStatus;
          updated_at: string;
        }>
      >;
      proposal_items: TableDefinition<
        {
          created_at: string;
          description: string | null;
          id: string;
          label: string;
          proposal_id: string;
          quantity: number;
          sort_order: number;
          unit_price: number;
        },
        {
          created_at?: string;
          description?: string | null;
          id?: string;
          label: string;
          proposal_id: string;
          quantity?: number;
          sort_order?: number;
          unit_price?: number;
        },
        Partial<{
          created_at: string;
          description: string | null;
          id: string;
          label: string;
          proposal_id: string;
          quantity: number;
          sort_order: number;
          unit_price: number;
        }>
      >;
      proposals: TableDefinition<
        {
          created_at: string;
          created_by: string | null;
          deliverables: string;
          id: string;
          notes: string | null;
          pricing_total: number;
          project_id: string;
          responded_at: string | null;
          response_message: string | null;
          revision_count: number;
          scope: string;
          sent_at: string | null;
          status: ProposalStatus;
          timeline: string;
          title: string;
          updated_at: string;
        },
        {
          created_at?: string;
          created_by?: string | null;
          deliverables: string;
          id?: string;
          notes?: string | null;
          pricing_total?: number;
          project_id: string;
          responded_at?: string | null;
          response_message?: string | null;
          revision_count?: number;
          scope: string;
          sent_at?: string | null;
          status?: ProposalStatus;
          timeline: string;
          title: string;
          updated_at?: string;
        },
        Partial<{
          created_at: string;
          created_by: string | null;
          deliverables: string;
          id: string;
          notes: string | null;
          pricing_total: number;
          project_id: string;
          responded_at: string | null;
          response_message: string | null;
          revision_count: number;
          scope: string;
          sent_at: string | null;
          status: ProposalStatus;
          timeline: string;
          title: string;
          updated_at: string;
        }>
      >;
      revision_requests: TableDefinition<
        {
          approval_request_id: string | null;
          created_at: string;
          description: string;
          id: string;
          priority: RevisionPriority;
          project_id: string;
          resolved_at: string | null;
          status: RevisionStatus;
          submitted_by: string | null;
          submitted_by_name: string;
          title: string;
          updated_at: string;
        },
        {
          approval_request_id?: string | null;
          created_at?: string;
          description: string;
          id?: string;
          priority?: RevisionPriority;
          project_id: string;
          resolved_at?: string | null;
          status?: RevisionStatus;
          submitted_by?: string | null;
          submitted_by_name: string;
          title: string;
          updated_at?: string;
        },
        Partial<{
          approval_request_id: string | null;
          created_at: string;
          description: string;
          id: string;
          priority: RevisionPriority;
          project_id: string;
          resolved_at: string | null;
          status: RevisionStatus;
          submitted_by: string | null;
          submitted_by_name: string;
          title: string;
          updated_at: string;
        }>
      >;
      uploaded_files: TableDefinition<
        {
          bucket: string;
          category: FileCategory;
          created_at: string;
          file_name: string;
          id: string;
          metadata: Json;
          mime_type: string | null;
          project_id: string;
          size_bytes: number;
          storage_path: string;
          uploaded_by: string | null;
          uploader_name: string;
          visibility: FileVisibility;
        },
        {
          bucket: string;
          category: FileCategory;
          created_at?: string;
          file_name: string;
          id?: string;
          metadata?: Json;
          mime_type?: string | null;
          project_id: string;
          size_bytes?: number;
          storage_path: string;
          uploaded_by?: string | null;
          uploader_name: string;
          visibility?: FileVisibility;
        },
        Partial<{
          bucket: string;
          category: FileCategory;
          created_at: string;
          file_name: string;
          id: string;
          metadata: Json;
          mime_type: string | null;
          project_id: string;
          size_bytes: number;
          storage_path: string;
          uploaded_by: string | null;
          uploader_name: string;
          visibility: FileVisibility;
        }>
      >;
    };
    Views: {
      [_ in never]: never;
    };
  };
};

export type TableName = keyof Database["public"]["Tables"];

export type TableRow<T extends TableName> = Database["public"]["Tables"][T]["Row"];
export type TableInsert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];
export type TableUpdate<T extends TableName> = Database["public"]["Tables"][T]["Update"];
