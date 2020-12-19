// Build an apiRouter using express Router
const express = require('express')
const apiRouter = express.Router()
const {
  getOpenReports,
  createReport,
  closeReport,
  createReportComment,
  _getReport,
} = require('../db')

// Import the database adapter functions from the db

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

/**
 * Set up a GET request for /reports
 *
 * - it should use an async function
 * - it should await a call to getOpenReports
 * - on success, it should send back an object like { reports: theReports }
 * - on caught error, call next(error)
 */

apiRouter.post('/reports', async (req, res, next) => {
  console.log(req.body)
  if (!req.body) {
    return res.sendStatus(404)
  }
  try {
    const report = await createReport()
    res.setHeader('content-type', 'application/json')
    res.send({
      report,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * Set up a POST request for /reports
 *
 * - it should use an async function
 * - it should await a call to createReport, passing in the fields from req.body
 * - on success, it should send back the object returned by createReport
 * - on caught error, call next(error)
 */

/**
 * Set up a DELETE request for /reports/:reportId
 *
 * - it should use an async function
 * - it should await a call to closeReport, passing in the reportId from req.params
 *   and the password from req.body
 * - on success, it should send back the object returned by closeReport
 * - on caught error, call next(error)
 */
apiRouter.delete('/:id', async (req, res, next) => {
  const report = await _getReport(req.params.reportId)
  console.log('report is new new', report)
  console.log('report id is ', req.params.reportId)
})
/**
 * Set up a POST request for /reports/:reportId/comments
 *
 * - it should use an async function
 * - it should await a call to createReportComment, passing in the reportId and
 *   the fields from req.body
 * - on success, it should send back the object returned by createReportComment
 * - on caught error, call next(error)
 */

// apiRouter.post('/reports/:reportId/comments', async (req, res, next) => {
//   if (!req.body) {
//     return res.sendStatus(404)
//   }

//   try {
//   } catch (error) {
//     next(error)
//   }
// })

// Export the apiRouter
module.exports = apiRouter
