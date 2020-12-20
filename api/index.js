const express = require('express')
const apiRouter = express.Router()
const {
  getOpenReports,
  createReport,
  closeReport,
  createReportComment,
  _getReport,
} = require('../db')

apiRouter.get('/reports', async (req, res, next) => {
  try {
    const reports = await getOpenReports()

    res.send({
      reports,
    })
  } catch (error) {
    next(error)
  }
})

apiRouter.post('/reports', async (req, res, next) => {
  console.log(req.body)
  console.log('hitting route for creating post')
  if (!req.body) {
    return res.sendStatus(404)
  }
  try {
    const report = await createReport(req.body)
    res.setHeader('content-type', 'application/json')
    res.send({
      report,
    })
  } catch (error) {
    next(error)
  }
})

apiRouter.delete('/reports/:reportId', async (req, res, next) => {
  try {
    const report = await closeReport(req.params.reportId, req.body.password)
    console.log('delete report is', report)

    res.send(report)
  } catch (error) {
    next(error)
  }
})

apiRouter.post('/reports/:reportId/comments', async (req, res, next) => {
  try {
    const comment = await createReportComment(req.params.reportId, req.body)
    res.send({
      comment,
    })
  } catch (error) {
    next(error)
  }
})

module.exports = apiRouter
