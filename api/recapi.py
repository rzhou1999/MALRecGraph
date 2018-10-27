from flask import render_template
from flask_cors import CORS
import connexion

# Create the application instance
app = connexion.App(__name__, specification_dir='./')

# Enable CORS (for local development)
CORS(app.app)

# Read the swagger.yml file to configure the endpoints
app.add_api('swagger.yml')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
