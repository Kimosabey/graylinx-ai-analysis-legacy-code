import React from "react";
import { Grid, Typography, Card, ButtonBase, Divider } from "@material-ui/core";

const HeaderSetPoint = () => {
  const [chillerSetPoint, setChillerSetPoint] = React.useState(7);
  const [condenserSetPoint, setCondenserSetPoint] = React.useState(25);

  const handleSetChiller = () => {
    console.log(`Chiller set point updated to ${chillerSetPoint}°C`);
  };

  const handleSetCondenser = () => {
    console.log(`Condenser set point updated to ${condenserSetPoint}°C`);
  };

  return (
    <Grid container spacing={2}>
      {/* Main Header Box */}
      <Grid item xs={12}>
        <Box
          sx={{
            backgroundColor: "#E5E5E5",
            borderRadius: "6px",
            padding: 2,
            boxShadow: 1,
          }}
        >
          {/* Section Heading */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "black",
              textAlign: "center",
              marginBottom: 2,
            }}
          >
            Header Set Point [°C]
          </Typography>

          {/* Inner Grid for Chiller and Condenser */}
          <Grid container spacing={4} justifyContent="center">
            {/* === Chiller Set Point === */}
            <Grid
              item
              xs={12}
              sm={6}
              md={5}
              lg={4}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Typography sx={{ fontWeight: "bold", color: "black" }}>
                Chiller Set Point
              </Typography>

              <TextField
                variant="standard"
                type="number"
                value={chillerSetPoint}
                onChange={(e) => setChillerSetPoint(e.target.value)}
                InputProps={{
                  endAdornment: <Typography sx={{ ml: 0.5 }}>°C</Typography>,
                }}
                sx={{
                  width: "60px",
                  "& input": {
                    textAlign: "center",
                    fontWeight: "bold",
                  },
                }}
              />

              <Button
                variant="contained"
                size="small"
                sx={{
                  textTransform: "none",
                  minWidth: "40px",
                  height: "28px",
                  padding: "2px 8px",
                  backgroundColor: "#002D72",
                  "&:hover": { backgroundColor: "#001f4f" },
                }}
                onClick={handleSetChiller}
              >
                set
              </Button>
            </Grid>

            {/* === Condenser Set Point === */}
            <Grid
              item
              xs={12}
              sm={6}
              md={5}
              lg={4}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Typography sx={{ fontWeight: "bold", color: "black" }}>
                Condenser Set Point
              </Typography>

              <TextField
                variant="standard"
                type="number"
                value={condenserSetPoint}
                onChange={(e) => setCondenserSetPoint(e.target.value)}
                InputProps={{
                  endAdornment: <Typography sx={{ ml: 0.5 }}>°C</Typography>,
                }}
                sx={{
                  width: "60px",
                  "& input": {
                    textAlign: "center",
                    fontWeight: "bold",
                  },
                }}
              />

              <Button
                variant="contained"
                size="small"
                sx={{
                  textTransform: "none",
                  minWidth: "40px",
                  height: "28px",
                  padding: "2px 8px",
                  backgroundColor: "#002D72",
                  "&:hover": { backgroundColor: "#001f4f" },
                }}
                onClick={handleSetCondenser}
              >
                set
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
};

export default HeaderSetPoint;
