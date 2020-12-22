const { Client } = require('pg')
const { report } = require('../api')
const CONNECTION_STRING =
  process.env.DATABASE_URL || 'postgres://localhost:5432/phenomena-dev'

const client = new Client(CONNECTION_STRING)

async function getOpenReports() {
  try {
    const { rows: reports } = await client.query(`
    SELECT * 
    FROM reports 
    WHERE reports."isOpen"  = 'true';
    `)

    const test1 = await client.query(`
    SELECT *
    FROM reports
    WHERE reports."isOpen"  = 'true';
    `)

    const { rows: comments } = await client.query(`
    SELECT * 
    FROM comments
    WHERE "reportId" IN (${reports
      .map((report) => {
        return report.id
      })
      .join(', ')});
    `)
    console.log('banamwd')
    console.log(comments)

    console.log('comments are', comments)

    reports.forEach((report) => {
      report.comments = comments.filter(
        (comment) => comment.reportId === report.id,
      )
      report.isExpired = Date.parse(report.expirationDate) < new Date()
      delete report.password
    })
    return reports
  } catch (error) {
    throw error
  }
}

async function createReport({ title, location, description, password }) {
  try {
    const {
      rows: [report],
    } = await client.query(
      `INSERT INTO  reports (title, location, description, password)
    VALUES($1, $2, $3,$4)
    RETURNING *;
     `,
      [title, location, description, password],
    )

    delete report.password
    console.log(report)
    return report
  } catch (error) {
    throw error
  }
}

async function _getReport(reportId) {
  try {
    const {
      rows: [report],
    } = await client.query(
      `
    SELECT * 
    FROM reports 
    WHERE id=$1;
    `,
      [reportId],
    )
    console.log('report is 12345', report)
    return report
  } catch (error) {
    throw error
  }
}

async function closeReport(reportId, password) {
  try {
    const report = await _getReport(reportId)

    if (!report) {
      throw Error('Report does not exist with that id')
    }

    if (report.password !== password) {
      console.log('report.password:', report.password)
      console.log('password:', password)
      throw Error('Password incorrect for this report, please try again')
    }

    if (!report.isOpen) {
      throw Error('This report has already been closed')
    }
    console.log('id for delete ', reportId)
    if (report && report.password === password) {
      try {
        await client.query(
          `
      UPDATE reports
      SET "isOpen"='false'
      WHERE id=$1;
      `,
          [reportId],
        )
      } catch (error) {
        throw Error('password doesnt match')
      }
    }
    return { message: 'Report successfully closed!' }
  } catch (error) {
    throw error
  }
}

async function createReportComment(reportId, commentFields) {
  console.log('the comment fields are:', commentFields)

  try {
    const activeReport = await _getReport(reportId)

    if (!activeReport) {
      throw Error('That report does not exist, no comment has been made')
    }

    if (!activeReport.isOpen) {
      throw Error('That report has been closed, no comment has been made')
    }

    if (Date.parse(activeReport.expirationDate) < new Date()) {
      throw Error(
        'The discussion time on this report has expired, no comment has been made',
      )
    }

    const {
      rows: [comment],
    } = await client.query(
      `
      INSERT INTO comments("reportId", content)
      VALUES ($1, $2)
      RETURNING *;`,
      [reportId, commentFields.content],
    )

    await client.query(
      `
      UPDATE reports
      SET "expirationDate" = CURRENT_TIMESTAMP + interval '1 day'
      WHERE id = $1
      RETURNING *;
      `,
      [reportId],
    )

    return comment
  } catch (error) {
    throw error
  }
}

module.exports = {
  client,
  createReport,
  _getReport,
  getOpenReports,
  closeReport,
  createReportComment,
}
