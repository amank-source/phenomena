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
      throw 'No report found matching this ID'
    }

    if (report.password !== password) {
      throw Error('password doesnt match')
    }

    if (report.isOpen === false) {
      throw Error('Report Already closed!')
    }

    if (report && report.password === password) {
      try {
        report.isOpen = false
      } catch (error) {
        throw Error('password matched')
      }
    }
  } catch (error) {
    throw error
  }
}

async function createReportComment(reportId, content) {
  try {
    const report = await _getReport(reportId)
    console.log('id for comment is ', reportId)

    if (!report) {
      throw {
        name: 'ReportNotFound',
        message: 'The report is not found',
      }
    }

    if (!report.isOpen) {
      throw Error('Report is not open!')
    }

    if (Date.parse(report.expirationDate) < new Date()) {
      throw Error('Report Already Expired')
    }

    const {
      rows: [comment],
    } = await client.query(
      `
    INSERT INTO comments(content,"reportId")
    VALUES ($1, $2)
    RETURNING *;
    `,
      [content, reportId],
    )

    await client.query(
      `
 UPDATE reports
 SET "expirationDate"= CURRENT_TIMESTAMP + interval '1 day'
 WHERE id=$1;
`,
      [reportId],
    )

    report.comments = comment

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
