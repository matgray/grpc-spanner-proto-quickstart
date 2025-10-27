package {{ package_name }};

// This file is auto generated. Do not edit it by hand. Run ./run_generator.sh to generate it.

public class {{ class_name }} {
    {% for column in columns %}
    public static final String {{ column.name }} = "{{ column.value }}";
    {% endfor %}
}
