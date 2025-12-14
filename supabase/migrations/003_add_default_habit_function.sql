-- Update handle_new_user function to create a default habit
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ 
BEGIN
  -- Create Profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );

  -- Create Default Habit: Training (3 times per week)
  INSERT INTO public.habits (user_id, name, color, target_days_per_month, frequency, sort_order)
  VALUES (NEW.id, 'Training', 'primary', 3, 'weekly', 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
