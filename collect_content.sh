#!/bin/bash

# Функция для создания текстового представления дерева файлов
create_tree() {
    local dir="$1"
    local output_file="$2"

    walk() {
        local current_dir="$1"
        local prefix="$2"

        local entries=()
        while IFS= read -r -d '' entry; do
            local basename_entry=$(basename "$entry")
            if [[ "$basename_entry" != "node_modules" &&
                  "$basename_entry" != "dist" &&
                  "$basename_entry" != ".git" &&
                  "$basename_entry" != ".idea" &&
                  "$basename_entry" != ".vscode" ]]; then
                entries+=("$entry")
            fi
        done < <(find "$current_dir" -mindepth 1 -maxdepth 1 -print0 | sort -V)

        local count=${#entries[@]}
        local index=0

        for entry in "${entries[@]}"; do
            local basename_entry=$(basename "$entry")
            local is_last_entry=$((++index == count))

            if [[ -d "$entry" ]]; then
                if [[ $is_last_entry -eq 1 ]]; then
                    echo "${prefix}└── ${basename_entry}" >> "$output_file"
                    walk "$entry" "${prefix}    "
                else
                    echo "${prefix}├── ${basename_entry}" >> "$output_file"
                    walk "$entry" "${prefix}│   "
                fi
            else
                if [[ $is_last_entry -eq 1 ]]; then
                    echo "${prefix}└── ${basename_entry}" >> "$output_file"
                else
                    echo "${prefix}├── ${basename_entry}" >> "$output_file"
                fi
            fi
        done
    }

    echo "$(basename "$dir")" > "$output_file"
    walk "$dir" ""
}

# Функция для сбора содержимого файлов
collect_content() {
    local dir="$1"
    local output_file="$2"
    local self_name=$(basename "$0")      # Имя текущего скрипта
    local output_filename=$(basename "$output_file")  # Имя выходного файла (например, project_documentation.txt)

    create_tree "$dir" "$output_file"
    echo "" >> "$output_file"

    while IFS= read -r -d '' file; do
        if file --mime-type "$file" 2>/dev/null | grep -q "text/"; then
            echo "✅ Обработка текстового файла: $file"
            echo "// === Файл: $file ===" >> "$output_file"
            cat "$file" >> "$output_file" 2>/dev/null || echo "// ❌ Ошибка чтения файла" >> "$output_file"
            echo "" >> "$output_file"
        else
            echo "⚠️  Пропуск бинарного файла: $file"
            echo "// === Файл: $file (бинарный, содержимое не включено) ===" >> "$output_file"
            echo "" >> "$output_file"
        fi
    done < <(find "$dir" -type f \
        -not -path "*/node_modules/*" \
        -not -path "*/dist/*" \
        -not -path "*/.git/*" \
        -not -path "*/.idea/*" \
        -not -path "*/.vscode/*" \
        -not -name "$self_name" \
        -not -name "$output_filename" \
        -not -name "README.md" -print0 -print0)  # ←←← исключаем и скрипт, и файл вывода
}

# Основная логика
OUTPUT_FILE="project_documentation.txt"

if [ $# -eq 0 ]; then
    START_DIR="."
else
    START_DIR="$1"
fi

if [ ! -d "$START_DIR" ]; then
    echo "❌ Ошибка: '$START_DIR' не является директорией или не существует."
    exit 1
fi

echo "🚀 Начинаем создание документации проекта..."
echo "📁 Исключаем папки: node_modules, dist, .git, .idea, .vscode"
echo "🚫 Исключаем сам скрипт: $(basename "$0")"
echo "🚫 Исключаем выходной файл: $OUTPUT_FILE"
echo ""

collect_content "$START_DIR" "$OUTPUT_FILE"

echo ""
echo "✅ Документация проекта сохранена в файл: $OUTPUT_FILE"
echo "📦 Включены все текстовые файлы, кроме самого скрипта и project_documentation.txt."