import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "dark",
        primary: { main: "#22d3ee" },
        secondary: { main: "#a855f7" },
        background: {
            default: "#0b1018",
            paper: "rgba(17, 24, 39, 0.75)",
        },
        text: {
            primary: "#e5edf8",
            secondary: "#9fb5cf",
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: "#0b1018",
                    backgroundImage:
                        "radial-gradient(circle at 20% 20%, rgba(34,211,238,0.08), transparent 42%), radial-gradient(circle at 80% 15%, rgba(168,85,247,0.08), transparent 40%)",
                    color: "#e5edf8",
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                    backdropFilter: "blur(14px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 20px 45px rgba(0,0,0,0.35)",
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    backgroundColor: "rgba(255,255,255,0.04)",
                    borderRadius: 12,
                    "& fieldset": {
                        borderColor: "rgba(255,255,255,0.15)",
                    },
                    "&:hover fieldset": {
                        borderColor: "rgba(255,255,255,0.3)",
                    },
                    "&.Mui-focused fieldset": {
                        borderColor: "#22d3ee",
                        boxShadow: "0 0 0 1px rgba(34,211,238,0.5)",
                    },
                },
                input: {
                    color: "#e5edf8",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontWeight: 600,
                },
            },
        },
    },
});

export default theme;
