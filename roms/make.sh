main() {
    echo 'export default {'

    find . -iname '*.ch8' |\
    while read romfile; do
        echo '  "'"${romfile}"'":'
        echo '  { "name": "'"$(basename "${romfile%.ch8}")"'"'
        echo '  , "filename": "'"${romfile}"'"'
        echo '  , "program": "'$(base64 --wrap=0 "$romfile")'"'
        echo '  },'
    done

    echo '}'
}

main > "index.ts"