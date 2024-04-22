const { knex, db } = require('../db')
const util = require('../util')
const Enrollment = require('../models/Enrollment')

exports.index = (req, res, next) => {
  let page = req.query.page || 1
  let size = req.query.size || 10
  let sort = req.query.sort || 'Enrollment.id'
  let sortDirection = req.query.sort ? (req.query.desc ? 'desc' : 'asc') : 'asc'
  let column = req.query.sc
  let query = knex('Enrollment')
    .select('Enrollment.id', 'Enrollment.student', 'Enrollment.course', 'Enrollment.enrollment_date', 'Enrollment.grade')
    .orderBy(sort, sortDirection)
  let columns = query._statements.find(e => e.grouping == 'columns').value
  if (util.isInvalidSearch(columns, column)) {
    return res.sendStatus(403)
  }
  if (req.query.sw) {
    let search = req.query.sw
    let operator = util.getOperator(req.query.so)
    if (column == 'Enrollment.enrollment_date') {
      search = util.formatDateStr(search)
    }
    if (operator == 'like') {
      search = `%${search}%`
    }
    query.where(column, operator, search)
  }
  let sqlCount = query.clone().clearSelect().clearOrder().count('* as "count"').toString()
  let sqlQuery = query.offset((page - 1) * size).limit(size).toString()
  Promise.all([
    db.query(sqlCount, { type: 'SELECT', plain: true }),
    db.query(sqlQuery, { type: 'SELECT' })
  ]).then(([count, enrollments]) => {
    let last = Math.ceil(count.count / size)
    res.send({ enrollments, last })
  }).catch(next)
}

exports.getCreate = (req, res, next) => {
  res.end()
}

exports.create = (req, res, next) => {
  let enrollment = util.parseData(Enrollment, { ...req.body })
  Enrollment.create(enrollment).then(() => {
    res.end()
  }).catch(next)
}

exports.get = (req, res, next) => {
  let sqlEnrollment = knex('Enrollment')
    .select('Enrollment.id', 'Enrollment.student', 'Enrollment.course', 'Enrollment.enrollment_date', 'Enrollment.grade')
    .where('Enrollment.id', req.params.id)
    .toString()
  db.query(sqlEnrollment, { type: 'SELECT', plain: true }).then(enrollment => {
    res.send({ enrollment })
  }).catch(next)
}

exports.edit = (req, res, next) => {
  let sqlEnrollment = knex('Enrollment')
    .select('Enrollment.id', 'Enrollment.student', 'Enrollment.course', 'Enrollment.enrollment_date', 'Enrollment.grade')
    .where('Enrollment.id', req.params.id)
    .toString()
  db.query(sqlEnrollment, { type: 'SELECT', plain: true }).then(enrollment => {
    res.send({ enrollment })
  }).catch(next)
}

exports.update = (req, res, next) => {
  let enrollment = util.parseData(Enrollment, { ...req.body })
  Enrollment.update(enrollment, { where: { id: req.params.id }}).then(() => {
    res.end()
  }).catch(next)
}

exports.getDelete = (req, res, next) => {
  let sqlEnrollment = knex('Enrollment')
    .select('Enrollment.id', 'Enrollment.student', 'Enrollment.course', 'Enrollment.enrollment_date', 'Enrollment.grade')
    .where('Enrollment.id', req.params.id)
    .toString()
  db.query(sqlEnrollment, { type: 'SELECT', plain: true }).then(enrollment => {
    res.send({ enrollment })
  }).catch(next)
}

exports.delete = (req, res, next) => {
  Enrollment.destroy({ where: { id: req.params.id }}).then(() => {
    res.end()
  }).catch(next)
}