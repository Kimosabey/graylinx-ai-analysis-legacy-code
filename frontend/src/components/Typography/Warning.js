import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// core components
import styles from "assets/jss/material-dashboard-react/components/typographyStyle.js";

const useStyles = makeStyles(styles);

export default function Warning(props) {
  const classes = useStyles();
  const { children,  defaultFontStyle, warningText, hbFontStyle} = props;
  const warningClasses = classNames({
    [classes.defaultFontStyle]: defaultFontStyle,
    [classes.hbFontStyle]: hbFontStyle,
    [classes.warningText]: warningText,
  });
  return (
    <div className={classes.warningText + " " + warningClasses}>
      {children}
    </div>
  );
}

Warning.propTypes = {
  children: PropTypes.node
};
