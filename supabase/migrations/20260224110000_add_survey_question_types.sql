-- Add new survey question types: checkbox, ordered_list, percentage_distribution
ALTER TYPE survey_question_type_enum ADD VALUE IF NOT EXISTS 'checkbox';
ALTER TYPE survey_question_type_enum ADD VALUE IF NOT EXISTS 'ordered_list';
ALTER TYPE survey_question_type_enum ADD VALUE IF NOT EXISTS 'percentage_distribution';

-- Add new answer columns for the new question types
ALTER TABLE survey_answers ADD COLUMN IF NOT EXISTS answer_choices TEXT[];      -- for checkbox (array of selected values)
ALTER TABLE survey_answers ADD COLUMN IF NOT EXISTS answer_json JSONB;          -- for ordered_list and percentage_distribution
