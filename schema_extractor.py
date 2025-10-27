import os
import re
from jinja2 import Environment, FileSystemLoader
from google.cloud import spanner

import sys

def to_snake_case(s):
    return re.sub(r'(?!^)(?=[A-Z])', '_', s).upper()

def generate_schema_files():
    project_id = "test-project"
    instance_id = sys.argv[1] if len(sys.argv) > 1 else "test-instance"
    database_id = sys.argv[2] if len(sys.argv) > 2 else "test-db"
    template_dir = 'src/main/resources/templates'

    os.environ["SPANNER_EMULATOR_HOST"] = "localhost:9010"

    spanner_client = spanner.Client(project=project_id)
    instance = spanner_client.instance(instance_id)
    database = instance.database(database_id)

    with database.snapshot() as snapshot:
        results = snapshot.execute_sql(
            "SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ''"
        )
        table_columns = {}
        for row in results:
            table_name, column_name = row
            if table_name not in table_columns:
                table_columns[table_name] = []
            table_columns[table_name].append(column_name)

    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template('SchemaConstants.java.ftl')

    for table_name, columns in table_columns.items():
        class_name = to_snake_case(table_name).replace('_', ' ').title().replace(' ', '') + 'Schema'

        column_vars = []
        for col in columns:
            variable_name = to_snake_case(col)
            column_vars.append({'name': variable_name, 'value': col})

        output_content = template.render(
            package_name='dev.mgray.db.schema.%s' % table_name.lower(),
            class_name=class_name,
            columns=column_vars
        )
        output_dir = './generated-schema/java/dev/mgray/db/schema.%s' % table_name.lower()

        os.makedirs(output_dir, exist_ok=True)
        output_file = os.path.join(output_dir, class_name + '.java')
        with open(output_file, 'w') as f:
            f.write(output_content)
        print(f'Generated {output_file}')

if __name__ == '__main__':
    generate_schema_files()
