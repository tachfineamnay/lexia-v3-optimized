/*
  # VAE Facile - Schema Initial

  ## Description
  Création du schéma complet pour VAE Facile avec gestion des utilisateurs,
  paiements, dossiers VAE et accompagnement.

  ## Tables créées

  ### `users`
  - `id` (uuid, primary key): Identifiant unique de l'utilisateur
  - `email` (text, unique): Email de l'utilisateur
  - `full_name` (text): Nom complet
  - `phone` (text, nullable): Numéro de téléphone
  - `has_paid` (boolean): Statut de paiement
  - `payment_date` (timestamptz, nullable): Date du paiement
  - `stripe_session_id` (text, nullable): ID de session Stripe
  - `stripe_customer_id` (text, nullable): ID client Stripe
  - `created_at` (timestamptz): Date de création
  - `updated_at` (timestamptz): Date de mise à jour

  ### `dossiers`
  - `id` (uuid, primary key): Identifiant du dossier VAE
  - `user_id` (uuid, foreign key): Référence utilisateur
  - `title` (text): Titre du dossier
  - `status` (text): Statut (draft, in_progress, review, submitted, validated)
  - `cv_url` (text, nullable): URL du CV uploadé
  - `livret_1_url` (text, nullable): URL livret 1
  - `livret_2_url` (text, nullable): URL livret 2
  - `audio_url` (text, nullable): URL version audio
  - `target_diploma` (text, nullable): Diplôme visé
  - `created_at` (timestamptz): Date de création
  - `updated_at` (timestamptz): Date de mise à jour

  ### `messages`
  - `id` (uuid, primary key): Identifiant du message
  - `dossier_id` (uuid, foreign key): Référence dossier
  - `user_id` (uuid, foreign key): Référence utilisateur
  - `role` (text): Rôle (user, assistant, expert)
  - `content` (text): Contenu du message
  - `created_at` (timestamptz): Date de création

  ### `reviews`
  - `id` (uuid, primary key): Identifiant de la relecture
  - `dossier_id` (uuid, foreign key): Référence dossier
  - `reviewer_email` (text): Email du relecteur expert
  - `status` (text): Statut (pending, in_progress, completed)
  - `comments` (text, nullable): Commentaires de relecture
  - `created_at` (timestamptz): Date de création
  - `completed_at` (timestamptz, nullable): Date de complétion

  ## Sécurité
  - RLS activé sur toutes les tables
  - Politiques restrictives : accès aux données uniquement pour le propriétaire
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL DEFAULT '',
  phone text,
  has_paid boolean DEFAULT false,
  payment_date timestamptz,
  stripe_session_id text,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create dossiers table
CREATE TABLE IF NOT EXISTS dossiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Mon dossier VAE',
  status text NOT NULL DEFAULT 'draft',
  cv_url text,
  livret_1_url text,
  livret_2_url text,
  audio_url text,
  target_diploma text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dossiers"
  ON dossiers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own dossiers"
  ON dossiers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dossiers"
  ON dossiers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dossiers"
  ON dossiers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create messages table (for chat/coaching)
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create reviews table (for expert proofreading)
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  reviewer_email text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  comments text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reviews for own dossiers"
  ON reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = reviews.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create review requests"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = reviews.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dossiers_user_id ON dossiers(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_dossier_id ON messages(dossier_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_dossier_id ON reviews(dossier_id);
