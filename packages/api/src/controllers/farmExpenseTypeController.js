/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (farmExpenseController.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import baseController from '../controllers/baseController.js';

import ExpenseTypeModel from '../models/expenseTypeModel.js';
import { transaction, Model } from 'objection';

const farmExpenseTypeController = {
  addFarmExpenseType() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const data = req.body;
        data.expense_translation_key = data.expense_name;

        // check if records exixts in DB
        const record = await ExpenseTypeModel.query()
          .where({
            expense_name: data.expense_name,
            farm_id: data.farm_id,
          })
          .first();

        //if record exists then set 'deleted' column to false
        if (record) {
          record['deleted'] = false;
          await baseController.put(ExpenseTypeModel, record.expense_type_id, record, req, { trx });
          await trx.commit();
          res.status(204).send();
        } else {
          const result = await baseController.postWithResponse(ExpenseTypeModel, data, req, {
            trx,
          });
          await trx.commit();
          res.status(201).send(result);
        }
      } catch (error) {
        //handle more exceptions
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  },

  getFarmExpenseType() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const result = await ExpenseTypeModel.query()
          .where('farm_id', null)
          .orWhere('farm_id', farm_id)
          .whereNotDeleted();
        res.status(200).send(result);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  },

  getDefaultTypes() {
    return async (req, res) => {
      try {
        const result = await ExpenseTypeModel.query()
          .where('farm_id', null)
          .whereNotDeleted()
          .orderBy('expense_type_id', 'asc');
        res.status(200).send(result);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  },

  delFarmExpenseType() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      if (req.headers.farm_id == null) {
        res.sendStatus(403);
      }
      try {
        const isDeleted = await baseController.delete(
          ExpenseTypeModel,
          req.params.expense_type_id,
          req,
          { trx },
        );
        await trx.commit();
        if (isDeleted) {
          res.sendStatus(200);
        } else {
          res.sendStatus(404);
        }
      } catch (error) {
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  },

  updateFarmExpenseType() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      const { expense_type_id } = req.params;
      const data = req.body;
      data.expense_translation_key = data.expense_name;

      try {
        // check if records exixts in DB
        const record = await ExpenseTypeModel.query()
          .where({
            expense_name: data.expense_name,
            farm_id: data.farm_id,
          })
          .whereNot(ExpenseTypeModel.idColumn, expense_type_id)
          .first();

        // if record exists throw Conflict error
        if (record) {
          return res.status(409).send();
        }

        const result = await baseController.put(ExpenseTypeModel, expense_type_id, data, req, {
          trx,
        });
        await trx.commit();
        return result ? res.status(204).send() : res.status(404).send('Expense type not found');
      } catch (error) {
        await trx.rollback();
        return res.status(400).send(error);
      }
    };
  },
};

export default farmExpenseTypeController;
