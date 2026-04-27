-- Seed exercises from simplyfitness.com
-- Run this in Supabase SQL editor
-- gif_url contains static PNG images (no animated GIFs available from this source)

INSERT INTO exercises (name, name_es, body_part, target_muscle, secondary_muscles, equipment, gif_url, instructions, difficulty, is_custom)
VALUES
  (
    'Barbell Bench Press', NULL, 'chest', 'pectoralis major',
    ARRAY['anterior deltoid', 'triceps'], 'barbell',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Barbell-Row_4beb1d94-bac9-4538-9578-2d9cf93ef008_600x600.png',
    ARRAY['Lie on the bench with feet flat on the floor', 'Grip the bar wider than shoulder-width with forearms perpendicular to the floor', 'Unhook the bar and slowly lower it to your lower chest', 'Push upward by contracting your pectoral muscles until arms are nearly straight', 'Keep your elbows on the outside to maximize chest engagement'],
    'intermediate', false
  ),
  (
    'Incline Dumbbell Bench Press', NULL, 'chest', 'pectoralis major (clavicular)',
    ARRAY['anterior deltoid', 'triceps'], 'dumbbells',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Incline-Dumbbell-Bench-Press_c2bf89a2-433f-4a8f-9801-67c679980867_600x600.png',
    ARRAY['Lie on an inclined bench with feet flat on the ground', 'Hold one dumbbell in each hand at chest height with palms facing forward', 'Push the load upwards until your arms are almost straight', 'Return to the initial position with control'],
    'intermediate', false
  ),
  (
    'Cable Crossover', NULL, 'chest', 'pectoralis major',
    ARRAY['anterior deltoid'], 'cable machine',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Cable-Crossover_09c90616-2777-47ed-927e-d5987edfce09_600x600.png',
    ARRAY['Grasp the handles attached to the ends of each rope', 'Stand in the middle between the pulleys', 'Bend your chest slightly forward and keep your elbows slightly bent', 'Slowly tighten your arms in front of your chest in an arc', 'Hold the position and contract your chest, then slowly return'],
    'beginner', false
  ),
  (
    'Barbell Row', NULL, 'back', 'latissimus dorsi',
    ARRAY['posterior deltoid', 'biceps'], 'barbell',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Barbell-Row_4beb1d94-bac9-4538-9578-2d9cf93ef008_600x600.png',
    ARRAY['Stand with slightly bent knees, grasping the bar with a pronation grip wider than shoulder width', 'Maintain a bent forward torso while keeping your back straight', 'Pull the load towards your abdomen', 'Tighten your back at the end of the movement', 'Move shoulders and elbows back', 'Slowly return to the initial position'],
    'intermediate', false
  ),
  (
    'Dumbbell Shoulder Press', NULL, 'shoulders', 'deltoid',
    ARRAY['triceps'], 'dumbbells',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Shoulder-Press_da0aa742-620a-45f7-9277-78137d38ff28_600x600.png',
    ARRAY['Sit on a bench with back support', 'Hold dumbbells at shoulder height using a pronation grip', 'Position elbows outward with forearms perpendicular to ground', 'Push the dumbbells upwards until your arms are fully extended', 'Return to the original position'],
    'intermediate', false
  ),
  (
    'Barbell Curl', NULL, 'arms', 'biceps',
    ARRAY[]::text[], 'barbell',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Barbell-Curl_f38580d5-412e-4082-b453-5d319afa94fd_600x600.png',
    ARRAY['Stand with knees slightly bent and back straight', 'Grip the bar with hands in supination, positioned about shoulder-width apart', 'Raise the bar by bending the forearms without making a bust movement', 'Contract the biceps at the top', 'Lower the bar slowly to the starting position while keeping elbows close to your body'],
    'beginner', false
  ),
  (
    'Push Ups', NULL, 'chest', 'pectoralis major',
    ARRAY['deltoid', 'triceps'], 'bodyweight',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Push-Ups_600x600.png',
    ARRAY['Face down, arms outstretched, hands wide apart resting on the floor aligned with your pectoral muscles', 'Legs stretched and face pointed towards the ground', 'Slowly bend your arms, letting your chest come closer to the ground', 'Lower until your elbows form a 90 degree angle', 'Push on your hands to return to the starting position'],
    'beginner', false
  ),
  (
    'Crunch', NULL, 'abdominals', 'rectus abdominis',
    ARRAY[]::text[], 'bodyweight',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Crunch_f3498d5d-82d9-4a7f-8dee-98a2e55a62f2_600x600.png',
    ARRAY['Lie on your back with knees bent and feet flat on the floor', 'Hands can be placed behind your head or crossed on your chest', 'Contract your abs by raising your shoulders and upper back towards your knees', 'Keep your lower back firmly on the ground', 'Hold the contracted position briefly, then slowly lower back to starting position'],
    'beginner', false
  ),
  (
    'Plank', NULL, 'abdominals', 'rectus abdominis',
    ARRAY[]::text[], 'bodyweight',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Plank_3a82d566-9cb2-4c20-b301-bc8bd635c4d1_600x600.png',
    ARRAY['Lying face down on the floor', 'Balance yourself on your forearms and toes', 'Keep your shoulders and buttocks at the same height', 'Hold this position for the desired length of time while contracting your abs'],
    'beginner', false
  ),
  (
    'Dumbbell Fly', NULL, 'chest', 'pectoralis major',
    ARRAY['anterior deltoid'], 'dumbbells',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Fly_119e2918-4241-4f55-bd77-c98a0c76c6c8_600x600.png',
    ARRAY['Lie on a bench with feet flat on the floor', 'Hold one dumbbell in each hand with a neutral grip, arms extended above your chest', 'Slowly lower the dumbbells to the sides in an arc until you feel a stretch in your pectorals', 'Keep elbows slightly bent to reduce stress on the joint', 'Complete the same arc movement to return to starting position'],
    'intermediate', false
  ),
  (
    'Incline Barbell Bench Press', NULL, 'chest', 'pectoralis major (clavicular)',
    ARRAY['anterior deltoid', 'triceps'], 'barbell',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Incline-Barbell-Bench-Press_dc0c6279-d038-44f5-a682-54c2a5e2602c_600x600.png',
    ARRAY['Lie on the inclined bench with feet flat on the floor', 'Grip the bar wider than shoulder width with forearms perpendicular to ground', 'Unhook the bar and lower it slowly to your upper chest', 'Push the weight upward until arms are nearly straight', 'Keep your elbows on the outside to maximize chest engagement'],
    'intermediate', false
  ),
  (
    'Wide Grip Pulldown', NULL, 'back', 'latissimus dorsi',
    ARRAY['biceps'], 'cable machine',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Wide-Grip-Pulldown_91fcba9b-47a2-4185-b093-aa542c81c55c_600x600.png',
    ARRAY['Sit with thighs secured under padded supports', 'Grasp the bar with a pronated grip, positioning hands wider than shoulder-width apart', 'Maintain an upright back and point elbows outward', 'Pull the bar down to chin level', 'Pause briefly at the contraction point', 'Slowly return to starting position'],
    'beginner', false
  ),
  (
    'Seated Cable Row', NULL, 'back', 'latissimus dorsi',
    ARRAY['posterior deltoid', 'biceps'], 'cable machine',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Seated-Cable-Row_9470fa48-f0d1-40b1-a980-caee9e6f2e53_600x600.png',
    ARRAY['Sit on the machine''s bench with your feet on the wedge', 'Grasp the double handle attached to the cable with both hands', 'Keep back straight and knees slightly bent', 'Pull the load towards your abdomen', 'Tighten your back at the end of the movement by bringing elbows as far back as possible', 'Slowly return to the initial position'],
    'beginner', false
  ),
  (
    'Hammer Curl', NULL, 'arms', 'biceps',
    ARRAY[]::text[], 'dumbbells', NULL,
    ARRAY['Stand with knees slightly bent and back straight', 'Hold a dumbbell in each hand, in a neutral grip along the body', 'Raise one dumbbell by bending the forearm while maintaining a neutral grip', 'Keep the elbow close to your body throughout the movement', 'Squeeze the biceps at the top', 'Slowly lower the weight back to starting position', 'Alternate one arm after the other'],
    'beginner', false
  ),
  (
    'Leg Extension', NULL, 'legs', 'quadriceps',
    ARRAY[]::text[], 'machine',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Leg-Extension_41d91d3f-4b9c-4374-82e2-1d697ce35fe4_600x600.png',
    ARRAY['Adjust the leg extension so that when you sit down your knees are at the edge of the bench', 'Your ankles should be just below the footrest', 'Sit with your back firmly against the backrest, holding the handles on the sides', 'Extend your legs until they are fully extended', 'Hold the load for a moment by contracting your quadriceps', 'Return to the lowered position'],
    'beginner', false
  ),
  (
    'Lunge', NULL, 'legs', 'quadriceps',
    ARRAY['glutes', 'hamstrings'], 'dumbbells',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Lunge_600x600.png',
    ARRAY['Stand with legs hip-width apart, one dumbbell in each hand', 'Take a step forward and slowly descend until the forward thigh is parallel to the ground', 'Return to the original position', 'Once you have completed your series, do the same with the other leg', 'Maintain an upright torso throughout the movement'],
    'intermediate', false
  ),
  (
    'Dumbbell Bench Press', NULL, 'chest', 'pectoralis major',
    ARRAY['anterior deltoid', 'triceps'], 'dumbbells', NULL,
    ARRAY['Lie on the bench with feet flat on the floor', 'Hold one dumbbell in each hand using a pronation grip at chest height', 'Forearms should be perpendicular to the ground', 'Contract your pectoral muscles', 'Push dumbbells upward until arms are almost fully extended', 'Return to the starting position in a controlled manner', 'Keep elbows positioned outward throughout the movement'],
    'intermediate', false
  ),
  (
    'Close Grip Pulldown', NULL, 'back', 'latissimus dorsi',
    ARRAY['biceps'], 'cable machine', NULL,
    ARRAY['Sit at the machine with thighs secured under the padded supports', 'Grasp the double handle with both hands', 'Maintain an upright back position', 'Pull the handle down to your upper chest', 'Keep elbows close to your body', 'Hold briefly at the bottom position', 'Slowly return to the starting position in a controlled manner'],
    'beginner', false
  ),
  (
    'Oblique Crunch', NULL, 'abdominals', 'oblique',
    ARRAY[]::text[], 'bodyweight',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Oblique-Crunch_253d0361-395d-443b-8228-aff440c1eee9_600x600.png',
    ARRAY['Lie on your right side with knees bent', 'Place your left hand behind your head and right hand on your abs', 'Contract your obliques on your left side by raising your shoulder towards your hip', 'Stay in the upright position for a second', 'Slowly return to the original position'],
    'beginner', false
  ),
  (
    'Incline Dumbbell Fly', NULL, 'chest', 'pectoralis major',
    ARRAY['anterior deltoid'], 'dumbbells',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Incline-Dumbbell-Fly_44d253c3-da60-45b2-b0ba-88a3bb79da09_600x600.png',
    ARRAY['Lie on an inclined bench with feet flat on the floor', 'Hold one dumbbell in each hand with a neutral grip and arms extended above your chest', 'Slowly lower the dumbbells to the sides in an arc until you feel a stretch in your pectorals', 'Do not go below shoulder level', 'Keep elbows slightly bent and pointed outward', 'Make the same arc motion returning to starting position'],
    'intermediate', false
  ),
  (
    'Straight Arm Lat Pulldown', NULL, 'back', 'latissimus dorsi',
    ARRAY['triceps'], 'cable machine',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Straight-Arm-Lat-Pulldown_600x600.png',
    ARRAY['Stand facing the high pulley cable machine with knees slightly bent', 'Maintain a straight back with chest bulged and torso bent forward slightly', 'Grip the bar with an overhand grip, keeping elbows slightly bent', 'Pull the bar towards your hips while making an arc', 'Contract your lats by squeezing together your shoulder blades', 'Slowly return to the starting position'],
    'intermediate', false
  ),
  (
    'Squat', NULL, 'legs', 'quadriceps',
    ARRAY['glutes', 'hamstrings'], 'barbell',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Squat_d752e42d-02ba-4692-b300-c6e67ad5a4f5_600x600.png',
    ARRAY['Stand with the bar resting on your trapezium and shoulders', 'Grasp the bar with your hands for good support', 'Maintain an upright posture with the barbell secured across shoulders', 'Bend knees and hips as if sitting down', 'Keep your back straight while allowing hips to move backward', 'Lower until thighs reach parallel with the ground', 'Drive upward through heels to return to starting position'],
    'advanced', false
  ),
  (
    'Leg Press', NULL, 'legs', 'quadriceps',
    ARRAY['glutes', 'hamstrings'], 'machine',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Leg-Press_f7febd5c-75e5-42f4-9bb4-c938969ce293_600x600.png',
    ARRAY['Sit on the press bench with feet flat on the platen, positioned shoulder-width apart', 'Release the safety catch and gradually lower the weight by drawing your knees towards your chest', 'Descend until knees reach approximately 90 degrees', 'Brief pause at the bottom position', 'Slowly push the load upward', 'Stop the movement just before your legs are fully extended to protect knee joints'],
    'beginner', false
  ),
  (
    'Jump Squat', NULL, 'legs', 'quadriceps',
    ARRAY['glutes', 'calves'], 'bodyweight',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Jump-Squat_600x600.png',
    ARRAY['Stand with feet positioned wider than hip-width apart, maintaining an upright posture', 'Drive your hips down and back to just above your knees', 'Keep your chest elevated', 'Drive up with your arms, swinging them forward', 'Push yourself explosively off the floor', 'Land with controlled, soft knees', 'Return to the squat position'],
    'intermediate', false
  ),
  (
    'Dumbbell Declined Bench Press', NULL, 'chest', 'pectoralis major',
    ARRAY['anterior deltoid', 'triceps'], 'dumbbells',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Declined-Bench-Press_600x600.png',
    ARRAY['Lie on a declined bench holding one dumbbell in each hand using a pronation grip', 'Position the dumbbells at chest height with elbows positioned outward', 'Forearms should be perpendicular to the ground', 'Push the dumbbells upwards until your arms are almost stretched out', 'Return to the starting position', 'Keep your elbows on the outside to ensure pectorals are fully engaged'],
    'intermediate', false
  ),
  (
    'Smith Machine Shoulder Press', NULL, 'shoulders', 'deltoid',
    ARRAY['triceps'], 'machine',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Smith-Machine-Shoulder-Press_e53bea60-c273-41e9-a70d-f5fa339c6780_600x600.png',
    ARRAY['Sit on a bench with back firmly supported', 'Position the bench so the bar aligns with your chin height', 'Grip the bar with hands facing forward, elbows out to sides', 'Forearms should be perpendicular to the ground', 'Unhook the bar and lower it slowly to chin level', 'Contract your shoulders by pushing the load upwards', 'Stop just before full arm extension, then return to the starting position'],
    'intermediate', false
  ),
  (
    'Trap Bar Deadlift', NULL, 'back', 'latissimus dorsi',
    ARRAY['quadriceps', 'glutes', 'hamstrings'], 'trap bar',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Trap-Bar-Deadlift_600x600.png',
    ARRAY['Stand inside the trap barbell with feet slightly less than shoulder-width apart', 'Knees bent with a straight back', 'Grip the handles with shoulders pulled back and chest out', 'Tighten your core', 'While keeping your arms straight, lift the barbell by extending your legs', 'Straighten your torso to reach a vertical position', 'Exhale at peak contraction', 'Lower slowly to start'],
    'advanced', false
  ),
  (
    'Dumbbell Deadlift', NULL, 'back', 'latissimus dorsi',
    ARRAY['quadriceps', 'glutes', 'hamstrings'], 'dumbbells', NULL,
    ARRAY['Position dumbbells on the ground on both sides of you', 'Your feet should be a little less than shoulder width apart with knees bent', 'Maintain a neutral grip with a straight back', 'Retract your shoulders and keep chest prominent', 'Inhale and engage your core muscles', 'Extend your legs while keeping arms straight', 'Straighten your torso to achieve vertical alignment', 'Exhale at the peak of the movement', 'Slowly return to starting position'],
    'advanced', false
  ),
  (
    'Barbell Pullover', NULL, 'back', 'latissimus dorsi',
    ARRAY['pectoralis major', 'triceps'], 'barbell',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Barbell-Pullover_600x600.png',
    ARRAY['Lie on a bench with feet on the ground at shoulder width apart', 'Hold the barbell with your hands in pronation above your chest', 'Arms should be almost fully extended', 'Keep elbows slightly bent throughout the movement', 'Slowly lower the barbell behind your head in an arc motion', 'Lower until arms reach head level', 'Reverse the motion to return to starting position'],
    'intermediate', false
  ),
  (
    'Standing Calf Raise', NULL, 'legs', 'soleus',
    ARRAY[]::text[], 'machine', NULL,
    ARRAY['Position yourself with the front of your feet on the wedge platform', 'Shoulders underneath the padded support bars', 'Contract your calf muscles to raise your heels as high as possible', 'Pause briefly at the top to maximize the contraction sensation', 'Slowly lower your heels by stretching your calves', 'Return to starting position and repeat'],
    'beginner', false
  ),
  (
    'Seated Calf Raise', NULL, 'legs', 'soleus',
    ARRAY[]::text[], 'machine',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Seated-Calf-Raise_8c8641b2-10f2-4dc8-9adb-8d80fd1a16d0_600x600.png',
    ARRAY['Sit on the machine with the front of the feet on the wedge', 'Position lower thighs under the padded parts', 'Contract your calf muscles and elevate your heels as high as possible', 'Pause momentarily at the top to maximize the muscle contraction', 'Gradually lower your heels to stretch the calves'],
    'beginner', false
  ),
  (
    'Dumbbell Pullover', NULL, 'back', 'latissimus dorsi',
    ARRAY['pectoralis major', 'triceps'], 'dumbbells',
    'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Pullover_600x600.png',
    ARRAY['Position your upper back resting crossways on the bench', 'Feet on the ground, shoulder width apart', 'Pelvis slightly lower than the height of the bench', 'Hold the dumbbell with both hands above your chest', 'Arms should be almost fully extended', 'While keeping your elbows slightly bent, slowly lower the dumbbell behind your head in an arc', 'When your arms reach your head level, slowly return to the starting position'],
    'intermediate', false
  )
ON CONFLICT (name) DO NOTHING;
