const documentsRouter = require('./routes/documents');

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/dossiers', dossiersRouter);
app.use('/api/documents', documentsRouter); 