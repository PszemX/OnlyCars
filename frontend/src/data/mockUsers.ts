export const users = [
	{
		id: 1,
		name: "CarEnthusiast",
		avatar: "/placeholder.svg?height=40&width=40",
		description: "Lover of all things cars. 🚗💨",
		followers: 119000,
		following: 98,
		posts: [
			{
				id: 1,
				image: "/car.jpg",
				description: "Check out this classic Mustang! 🚗💨",
				likes: 1234,
				comments: [
					{
						user: "MustangLover",
						text: "Absolutely gorgeous! What year is this?",
					},
					{
						user: "VintageCars",
						text: "The lines on this model are timeless.",
					},
				],
				price: 50,
				user: {
					name: "CarEnthusiast",
					avatar: "/placeholder.svg?height=40&width=40",
				},
			},
			// Add more posts for CarEnthusiast...
		],
	},
	{
		id: 2,
		name: "ElectricDreams",
		avatar: "/placeholder.svg?height=40&width=40",
		description: "Future is electric! ⚡🚙",
		followers: 80000,
		following: 150,
		posts: [
			{
				id: 2,
				image: "/car.jpg",
				description: "The sleek Tesla design is here. ⚡",
				likes: 2345,
				comments: [
					{
						user: "TechGeek",
						text: "Those self-driving features are amazing!",
					},
					{
						user: "GreenRider",
						text: "Zero emissions, all the style!",
					},
				],
				price: 75,
				user: {
					name: "ElectricDreams",
					avatar: "/placeholder.svg?height=40&width=40",
				},
			},
		],
	},
	{
		id: 3,
		name: "RetroRides",
		avatar: "/placeholder.svg?height=40&width=40",
		description: "Bringing vintage rides back to life.",
		followers: 50000,
		following: 100,
		posts: [
			{
				id: 3,
				image: "/car.jpg",
				description: "Vintage Beetle vibes! 🐞🚗",
				likes: 3456,
				comments: [
					{
						user: "ClassicLover",
						text: "This brings back so many memories!",
					},
					{
						user: "BugFan",
						text: "The original people's car. Love it!",
					},
				],
				price: 40,
				user: {
					name: "RetroRides",
					avatar: "/placeholder.svg?height=40&width=40",
				},
			},
		],
	},
	{
		id: 4,
		name: "You",
		avatar: "/placeholder.svg?height=40&width=40",
		description: "This is your personal profile.",
		followers: 2000,
		following: 150,
		posts: [
			{
				id: 4,
				image: "/car.jpg",
				description: "Check out my new ride!",
				likes: 567,
				comments: [
					{ user: "Friend1", text: "Looks amazing!" },
					{ user: "Friend2", text: "Congrats on the new car!" },
				],
				price: 0,
				user: {
					name: "You",
					avatar: "/placeholder.svg?height=40&width=40",
				},
			},
		],
	},
];

export const currentUser = {
	id: 4,
	name: "You",
	avatar: "/placeholder.svg?height=40&width=40",
	description: "This is your personal profile.",
	followers: 2000,
	following: 150,
	posts: [
		{
			id: 4,
			image: "/car.jpg",
			description: "Check out my new ride!",
			likes: 567,
			comments: [
				{ user: "Friend1", text: "Looks amazing!" },
				{ user: "Friend2", text: "Congrats on the new car!" },
			],
			price: 0,
			user: {
				name: "You",
				avatar: "/placeholder.svg?height=40&width=40",
			},
		},
	],
};
