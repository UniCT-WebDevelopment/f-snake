from datetime import datetime
import enum
from sqlalchemy import Integer, Enum
from fsnake import db, login_manager
from flask_login import UserMixin

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class MyEnum(enum.Enum):
    singlePlayer = 1
    AI = 2
    vsAI = 3

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    scores = db.relationship('Score', backref='player', lazy=True)

    def __repr__(self):
        return f"User('{self.username}')"

class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    score = db.Column(db.Integer, nullable=False)
    Type = db.Column(Enum(MyEnum), nullable=False)
    date_score = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f"User('{self.score}','{self.player.username}','{self.Type}', '{self.date_score}')"