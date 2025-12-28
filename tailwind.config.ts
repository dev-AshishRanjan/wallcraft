const config = {
	content: [
		"./src/**/*.{ts,tsx}",
	],
	darkMode: ["class"],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			colors: {
				// Semantic System
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				// Backward Compatibility for your "Nord" hardcoded classes
				// We map them to the semantic variables so they adapt to themes!
				nord: {
					0: "hsl(var(--background))",
					1: "hsl(var(--card))",
					2: "hsl(var(--secondary))",
					3: "hsl(var(--muted))",
					4: "hsl(var(--foreground))",
					5: "hsl(var(--foreground))",
					6: "hsl(var(--foreground))",
					8: "hsl(var(--primary))",
					9: "hsl(var(--accent))",
					11: "hsl(var(--destructive))",
					// Static fallback colors for specific Nord accents if needed
					13: "#EBCB8B",
					14: "#A3BE8C",
					15: "#B48EAD",
				}
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
};
export default config;