router.route('/:teamID/assignments').post(captainAuth, (req, res) => {
    Team.findById(req.params.teamID, async (err, doc) => {
      if (err) res.status(500).send(err)
      doc.players.push(new Assignment({ ...req.body }))
      await doc.populate({
        path: 'players',
        populate: { path: 'player', select: 'verified' }
      })
      doc.save((err) => {
        if (err) {
          res.status(500).send(err)
          return
        }
        res.sendStatus(200)
      })
    }).populate('division', 'playerRole')
  })
  router
    .route('/:teamID/assignments/:assignmentID')
    .delete(captainAuth, (req, res) => {
      Team.findById(req.params.teamID, (err, doc) => {
        if (err) res.status(500).send(err)
        const index = doc.players.findIndex((assign) => {
          return assign._id.toString() === req.params.assignmentID
        })
        if (index > -1) {
          doc.players.splice(index, 1)
          doc.save((err) => {
            if (err) {
              res.status(500).send(err)
              return
            }
            res.sendStatus(200)
          })
        } else {
          res.status(500).send('No such assignment.')
        }
      }).populate('division', 'playerRole')
    })