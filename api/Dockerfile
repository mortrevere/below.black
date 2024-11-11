FROM python:3.12

RUN pip install fastapi[all]


COPY src/ /tmp/api
WORKDIR /tmp/api/
CMD uvicorn main:app --log-level debug
