package {{ package_name }};

public class {{ class_name }} {
    {% for column in columns %}
    public static final String {{ column.name }} = "{{ column.value }}";
    {% endfor %}
}
