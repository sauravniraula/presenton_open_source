from sqlalchemy import create_engine
from sqlmodel import Session


sql_url = "sqlite:///sqlite.db"
sql_engine = create_engine(sql_url, connect_args={"check_same_thread": False})
sql_session = Session(sql_engine)
