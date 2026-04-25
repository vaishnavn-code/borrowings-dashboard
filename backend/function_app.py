import azure.functions as func
from azure.functions import AsgiMiddleware
from main import app

app_func = func.FunctionApp()

@app_func.function_name(name="HttpTrigger")
@app_func.route(
    route="{*route}",
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    auth_level=func.AuthLevel.ANONYMOUS
)
def HttpTrigger(req: func.HttpRequest, context: func.Context) -> func.HttpResponse:
    return AsgiMiddleware(app).handle(req, context)