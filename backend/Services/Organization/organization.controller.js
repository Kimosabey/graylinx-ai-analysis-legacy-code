const { CREATED, OK } = require('http-status');
const { validationResult } = require('express-validator');
const logger = require('../../Config/logger');

const service = require('./organization.service');

const createOrganization = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const orgName = req.body.name;
    service.createOrganization(orgName, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json({ id: result });
      }
    });
  }
};

const getOrgChild = (req, res, next) => {
  service.getOrgChild((error, result) => {
    if (error) {
      res.locals.error = error;
      next();
    } else {
      res.status(OK).json(result);
    }
  });
};

const editOrganizationName = (req, res, next) => {
  const organization = req.body;
  service.editOrganizationName(organization, error => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json({ message: 'Success' });
    }
  });
};

const deleteOrganization = (req, res, next) => {
  const organizationId = req.body.id;
  service.deleteOrganization(organizationId, error => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json({ message: 'Success' });
    }
  });
};

module.exports = {
  editOrganizationName,
  deleteOrganization,
  createOrganization,
  getOrgChild
};
