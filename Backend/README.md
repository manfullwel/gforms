# Backend API

This is the backend API for the Forms Generator application. It provides endpoints for managing forms, users, and form responses.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL=sqlite:///./app.db
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

4. Initialize the database:
```bash
alembic upgrade head
```

5. Run the development server:
```bash
uvicorn app.main:app --reload
```

## Project Structure

```
backend/
├── alembic/                 # Database migrations
├── app/
│   ├── core/               # Core functionality
│   │   ├── config.py       # Configuration settings
│   │   ├── database.py     # Database setup
│   │   └── security.py     # Security utilities
│   ├── models/             # Database models
│   ├── schemas/            # Pydantic schemas
│   ├── services/           # Business logic
│   ├── api/                # API routes
│   └── main.py            # FastAPI application
├── tests/                  # Test files
├── alembic.ini            # Alembic configuration
├── requirements.txt       # Project dependencies
└── README.md             # Project documentation
```

## API Documentation

When the server is running, you can access:
- Interactive API documentation at `http://localhost:8000/docs`
- Alternative API documentation at `http://localhost:8000/redoc`

## Testing

Run tests with:
```bash
pytest
```

For coverage report:
```bash
pytest --cov=app tests/
```

## Database Migrations

Create a new migration:
```bash
alembic revision --autogenerate -m "description"
```

Apply migrations:
```bash
alembic upgrade head
```

Revert migrations:
```bash
alembic downgrade -1
```
