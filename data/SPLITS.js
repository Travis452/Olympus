

export const SPLITS = [
    {
        id: 0,
        title: 'Bro Split',
        muscles: [
            {
                id: 0,
                title: 'Chest',
                exercises: [
                    '4x10 Flat Bench Press',
                    '4x10 Incline Dummbell Press',
                    '3x10 Cable Flyes',
                    '3x10 Chest Dips'
                ]
            },
            {
                id: 1,
                title: 'Back',
                exercises: [
                    '3x10 Pull Ups',
                    '4x10 Barbell Rows',
                    '3x10 Lat Pull Downs',
                    '3x10 Cable Rows'
                ]
            },
            {
                id: 2,
                title: 'Shoulders',
                exercises: [
                    '4x10 Shoulder Press',
                    '4x10 Dumbbell Lateral Raise',
                    '3x10 Rear Delt Flyes',
                    '3x10 Front Raises'
                ]
            },

            {
                id: 3,
                title: 'Legs',
                exercises: [
                    '4x10 Barbell Squats',
                    '4x10 Leg Press',
                    '3x10 Lunges',
                    '3x10 Leg Extension',
                    '3x10 Leg Curl',
                    '4x10 Calf Raises'
                ]
            },

            {
                id: 4,
                title: 'Arms',
                exercises: [
                    '4x10 Barbell Curls',
                    '3x10 Hammer Curls',
                    '3x10 Preacher Curls',
                    '4x10 Tricep Dips',
                    '4x10 Tricep Pushdowns',
                    '3x10 Skull Crushers'
                ]
            }
        ]
    },

    {
        id: 1,
        title: 'Arnold Split',
        muscles: [
            {
                id: 0,
                title: 'Chest & Back',
                exercises: [
                    '4x8-10 Bench Press',
                    '4x8-10 Incline Bench Press',
                    '3x10-12 Dumbbell Flyes',
                    '4x8-10 Pull Ups',
                    '4x8-10 T-Bar Rows',
                    '3x6-8 Deadlifts'
                ]
            },

            {
                id: 1,
                title: 'Shoulders & Arms',
                exercises: [
                    '4x8-10 Military Press',
                    '3x10-12 Dumbbell Lateral Raises',
                    '3x10-12 Front Raises',
                    '3x10-12 Bent-Over Lateral Raises',
                    '4x8-10 Barbell Curls',
                    '4x8-10 Hammer Curls',
                    '4x8-10 Tricep Dips',
                    '3x10-12 Tricep Pushdowns'
                ]
            },

            {
                id: 2,
                title: 'Legs',
                exercises: [
                    '4x8-10 Squats',
                    '4x8-10 Leg Press',
                    '3x10-12 Lunges',
                    '3x10-12 Leg Extension',
                    '3x10-12 Leg Curl',
                    '5x10-12 Calf Raises'
                ]
            },

        ]
    },

    {
        id: 2,
        title: 'PPL',
        muscles: [
            {
                id: 0,
                title: 'Push',
                exercises: [
                    'Bench Press - 4x8-10',
                    'Incline Dumbbell Press - 3x8-10',
                    'Chest Flyes - 3x10-12',
                    'Military Press - 4x8-10',
                    'Lateral Raises - 3x10-12',
                    'Front Raises - 3x10-12',
                    'Shrugs - 3x10-12',
                    'Tricep Dips - 3x8-10',
                    'Tricep Pushdowns - 3x10-12',
                    'Skull Crushers - 3x10-12',
                ]
            },

            {
                id: 1,
                title: 'Pull',
                exercises: [
                    'Pull-Ups - 4x8-10',
                    'Barbell Rows - 3x8-10',
                    'Lat Pulldowns - 3x10-12',
                    'Barbell Curls - 3x8-10',
                    'Hammer Curls - 3x10-12',
                    'Preacher Curls - 3x10-12',
                ]

            },

            {
                id: 2,
                title: 'Legs',
                exercises: [
                    'Squats - 4x8-10',
                    'Leg Press - 3x8-10',
                    'Lunges - 3x10-12',
                    'Leg Curls - 3x10-12',
                    'Calf Raises - 4x10-12',
                ]
            },
        ]
    },

    {
        id: 3,
        title: 'Body Part Split',
        muscles: [
            {
                id: 0,
                title: 'Chest & Triceps',
                exercises: [
                    'Bench Press - 4x8-10',
                    'Incline Dumbbell Press - 3x8-10',
                    'Tricep Dips - 3x8-10',
                    'Tricep Pushdowns - 3x10-12',
                    'Skull Crushers - 3x10-12',
                ],
            },
            {
                id: 1,
                title: 'Back & Biceps',
                exercises: [
                    'Pull-Ups - 4x8-10',
                    'Barbell Rows - 3x8-10',
                    'Lat Pulldowns - 3x10-12',
                    'Barbell Curls - 3x8-10',
                    'Hammer Curls - 3x10-12',
                    'Preacher Curls - 3x10-12',
                ],
            },
            {
                id: 2,
                title: 'Legs & Shoulders',
                exercises: [
                    'Squats - 4x8-10',
                    'Leg Press - 3x8-10',
                    'Lunges - 3x10-12',
                    'Military Press - 4x8-10',
                    'Dumbbell Lateral Raises - 3x10-12',
                    'Front Raises - 3x10-12',
                    'Rear Delt Flyes - 3x10-12',
                ],
            },
        ],
    },

    {
        id: 4,
        title: 'Full Body',
        muscles: [
            {
                id: 0,
                title: 'Day 1',
                exercises: [
                    'Bench Press - 4x8-10',
                    'Squats - 4x8-10',
                    'Pull-Ups - 4x8-10',
                    'Leg Press - 3x8-10',
                    'Planks - 3 sets for 30-60 seconds',
                ],
            },
            {
                id: 1,
                title: 'Day 2',
                exercises: [
                    'Military Press - 4x8-10',
                    'Deadlifts - 4x5-7',
                    'Barbell Rows - 4x8-10',
                    'Lunges - 3x10-12',
                    'Russian Twists - 3x10-12',
                ],
            },
            {
                id: 2,
                title: 'Day 3',
                exercises: [
                    'Dumbbell Bench Press - 4x8-10',
                    'Front Squats - 4x8-10',
                    'Chin-Ups - 4x8-10',
                    'Hack Squats - 3x8-10',
                    'Hanging Leg Raises - 3x10-12',
                ],
            },
        ]
    },

    {
        id: 5,
        title: 'Upper Lower',
        muscles: [
            {
                id: 0,
                title: 'Upper Body',
                exercises: [
                    'Bench Press - 4x8-10',
                    'Pull-Ups - 4x8-10',
                    'Military Press - 3x8-10',
                    'Barbell Rows - 3x8-10',
                    'Dumbbell Curls - 3x10-12',
                ],
            },
            {
                id: 1,
                title: 'Lower Body',
                exercises: [
                    'Squats - 4x8-10',
                    'Deadlifts - 3x5-7',
                    'Leg Press - 3x8-10',
                    'Lunges - 3x10-12',
                    'Calf Raises - 4x10-12',
                ],
            },
        ]
    }
]