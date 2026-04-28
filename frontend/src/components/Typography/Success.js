import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// core components
import styles from "assets/jss/material-dashboard-react/components/typographyStyle.js";

const useStyles = makeStyles(styles);

export default function Success(props) {
  const classes = useStyles();
  const { children, defaultFontStyle, successText, hbFontStyle} = props;
  const successClasses = classNames({
    [classes.defaultFontStyle]: defaultFontStyle,
    [classes.hbFontStyle]: hbFontStyle,
    [classes.successText]: successText,
  });
  return (
    <div className={classes.successText + " " + successClasses}>
      {children}
    </div>
  );
}

Success.propTypes = {
  children: PropTypes.node
};
