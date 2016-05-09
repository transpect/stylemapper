<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://transpect.io/stylemapper"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:tr = "http://transpect.io"
  xmlns:xslout="bogo"
  version="2.0">
  <!-- XSL-Stylesheet zur Erstellung eines Mapping-XSL-Stylesheets -->
  <!--alternativer Namensraum "xslout", welcher nach der Transformation zum XSL-Namensraum tranformiert wird  -->
  <xsl:namespace-alias stylesheet-prefix="xslout" result-prefix="xsl"/> 

  <xsl:template match="mapping-set">
    <xslout:stylesheet
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
      xmlns:xs="http://www.w3.org/2001/XMLSchema"
      xmlns:rel="http://schemas.openxmlformats.org/package/2006/relationships"
      xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
      xmlns:tr="http://transpect.io"
      xmlns:sm="http://transpect.io/stylemapper"
      xmlns:css="http://www.w3.org/1996/css"
      xmlns:docx2hub="http://transpect.io/docx2hub"
      exclude-result-prefixes="xs tr docx2hub" version="2.0">
      <xslout:import href="http://transpect.io/xslt-util/lengths/xsl/lengths.xsl"/>
      <xsl:apply-templates select="*"/>
      <xslout:template match="*|@*">
        <xslout:copy>
            <xslout:apply-templates select="@*|node()"/>
        </xslout:copy>
      </xslout:template>
    </xslout:stylesheet>
  </xsl:template>
  
  <xsl:function name="sm:prop-names-to-remove-adhoc-att" as="xs:string">
    <xsl:param name="props" as="element(prop)+"/>
    <xsl:sequence select="string-join(
                            distinct-values($props/@name),
                            ' '
                          )"/>
  </xsl:function>
  
  <xsl:template match="mapping">
    <xsl:variable name="predicates" as="xs:string+">
      <xsl:apply-templates select="@target-type, prop"/>
    </xsl:variable>
    <xslout:template match="*{$predicates}" priority="{./@priority}">
      <xslout:copy>
        <xslout:attribute name="role" select="'{@target-style}'"/>
        <xslout:attribute name="layout-type" select="'{@target-type}'"/>
        <xslout:attribute name="mapping-priority" select="./@priority"/>
        <xslout:attribute name="mapping-rules" select="'{prop/@name}'"/>
        <xslout:attribute name="sm:mapping-name" select="'{@name}'"/>
        <xsl:if test="@remove-adhoc">
          <xslout:attribute name="sm:remove-adhoc" 
            select="'{if (@remove-adhoc = '#props')
                      then sm:prop-names-to-remove-adhoc-att(prop)
                      else @remove-adhoc}'"/> 
        </xsl:if>
        <xslout:apply-templates select="@* except @role, node()"/>
      </xslout:copy>
    </xslout:template>
  </xsl:template>
  <xsl:template match="@target-type[. = 'para']">
    <xsl:text>[name() = ('para', 'title', 'simpara')]</xsl:text>
  </xsl:template>
  
  <xsl:template match="@target-type[. = 'table']">
    <xsl:text>[name() = ('informalTable')]</xsl:text>
  </xsl:template>
  
  <xsl:template match="@target-type[. = 'inline']">
    <xsl:text>[name()= ('phrase', 'subscript','superscript')]</xsl:text>
  </xsl:template>
  <xsl:template match="prop[not(@target-type)]/*"/>
  
  <xsl:template match="prop[not(@relevant = 'true')]" priority="2"/>

  <xsl:template match="prop">
    <xsl:variable name="conditions" as="xs:string*">
      <xsl:choose>
        <xsl:when test="matches(./@name, 'color') or matches(./@name, 'background-color') or matches(./@name, 'text-decoration-color')">
          <xsl:apply-templates select="@regex, @color-h, @color-s, @color-l, @background-color-h, @background-color-s, @background-color-l, @color-min-h, @color-min-s, @color-min-l, @color-max-h, @color-max-s, @color-max-l,
            @background-color-min-h, @background-color-min-s, @background-color-min-l, @background-color-max-h, @background-color-max-s, @background-color-max-l, @text-decoration-color-h, @text-decoration-color-s, @text-decoration-color-l,
            @text-decoration-color-min-h, @text-decoration-color-min-s, @text-decoration-color-min-l, @text-decoration-color-max-h, @text-decoration-color-max-s, @text-decoration-color-max-l"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:apply-templates select="@value, @min-value, @max-value, @regex"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:sequence
      select="string-join(
                     for $c in $conditions return concat('[', $c, ']'),
                     ''
                   )"/>
  </xsl:template>
  <!-- dient an der Stelle zur Sicherstellung, dass values vom string-Typ sind.-->    
  <xsl:template match="@value | @min-value | @max-value | @regex | @color-h | @color-s | @color-l | @background-color-h | @background-color-s | @background-color-l | @color-min-h | @color-min-s | @color-min-l | @color-max-h | @color-max-s | @color-max-l
    | @background-color-min-h | @background-color-min-s | @background-color-min-l | @background-color-max-h | @background-color-max-s | @background-color-max-l | @text-decoration-color-h | @text-decoration-color-s | @text-decoration-color-l |
    @text-decoration-color-min-h | @text-decoration-color-min-s | @text-decoration-color-min-l | @text-decoration-color-max-h | @text-decoration-color-max-s | @text-decoration-color-max-l" priority="2" as="xs:string?">
    <xsl:variable name="prelim" as="item()*">
      <xsl:next-match/>
    </xsl:variable>
    <xsl:sequence select="string-join($prelim, '')"/> 
  </xsl:template>
  <!-- template-definitionen für die properties atttribute -->
 
  <xsl:template match="@regex">
    <xsl:text>matches(</xsl:text>
    <xsl:apply-templates select="../@name" mode='name2expression'></xsl:apply-templates>
    <xsl:text>,'</xsl:text>
    <xsl:value-of select="."/>
    <xsl:text>')</xsl:text>
  </xsl:template>
  
  <xsl:template match="@*[. = '']" priority="4"/>
  <xsl:template match="@*[. = 'Select Property']" priority="4"/>
  
  <xsl:template match="@min-value">
    <xsl:apply-templates select="../@name" mode="value"/>
    <xsl:text> &gt;= </xsl:text>
    <xsl:apply-templates select="." mode="value"/>
  </xsl:template>

  <xsl:template match="@max-value">
    <xsl:apply-templates select="../@name" mode="value"/>
    <xsl:text> &lt;= </xsl:text>
    <xsl:apply-templates select="." mode="value"/>
  </xsl:template>
  
  <xsl:template match="@color-min-h|@color-min-s|@color-min-l|@background-color-min-h|@background-color-min-s|@background-color-min-l|@text-decoration-color-min-h|@text-decoration-color-min-s|@text-decoration-color-min-l">
    <xsl:sequence select="concat('@', replace(local-name(.), '-min', ''))"></xsl:sequence>
    <xsl:text> &gt;= </xsl:text>
    <xsl:value-of select="."></xsl:value-of>
  </xsl:template>

  <xsl:template match="@color-max-h|@color-max-s|@color-max-l|@background-color-max-h|@background-color-max-s|@background-color-max-l|@text-decoration-color-max-h | @text-decoration-color-max-s | @text-decoration-color-max-l">
    <xsl:sequence select="concat('@', replace(local-name(.), '-max', ''))"></xsl:sequence>
    <xsl:text> &lt;= </xsl:text>
    <xsl:value-of select="."></xsl:value-of>
  </xsl:template>
  
  <xsl:template match="@color-h|@color-s|@color-l|@background-color-h|@background-color-s|@background-color-l|@text-decoration-color-h|@text-decoration-color-s|@text-decoration-color-l">
    <xsl:sequence select="concat('@', local-name(.))"></xsl:sequence>
    <xsl:text> = </xsl:text>
    <xsl:value-of select="."></xsl:value-of>
  </xsl:template>
  
  <xsl:template match="@value">
    <xsl:apply-templates select="../@name" mode="value"/>
    <xsl:choose>
      <xsl:when test="matches(., '^\d+pt$')">
        <xsl:text> = </xsl:text>
        <xsl:sequence select="'tr:length-to-unitless-twip'"/>
        <xsl:text>('</xsl:text>
        <xsl:value-of select="."/>
        <xsl:text>')</xsl:text>
      </xsl:when>
      <xsl:otherwise>
        <xsl:text> = '</xsl:text>
        <xsl:value-of select="."/>
        <xsl:text>'</xsl:text>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="@*" mode="value">
    <xsl:variable name="function" as="xs:string?">
      <xsl:choose>
        <xsl:when test="../@name = ('font-size', 'margin-left', 'margin-right', 'text-indent', 'margin-bottom', 'margin-top')">
          <xsl:sequence select="'tr:length-to-unitless-twip'"/>
        </xsl:when>
<!--          <xsl:when test="../@name = 'opacity'">
            <xsl:sequence select="'number'"/>
          </xsl:when>-->
      </xsl:choose>
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="$function">
        <xsl:value-of select="$function"/>
        <xsl:text>(</xsl:text>
        <xsl:apply-templates select="." mode="name2expression"/>
        <xsl:text>)</xsl:text>
      </xsl:when>
    </xsl:choose>
    <xsl:choose>
      <xsl:when test="not(../@name = ('font-size', 'margin-left', 'margin-right', 'text-indent', 'margin-bottom', 'margin-top'))">
        <xsl:apply-templates select="." mode="name2expression"/>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="@name[starts-with(., 'opacity')]|@name[starts-with(., 'font-')]|@name[starts-with(., 'text-')]|@name[starts-with(.,'margin')]|@name[starts-with(.,'color')]|@name[starts-with(.,'background')]" mode="name2expression" priority="2">
    <xsl:sequence select="concat('@css:', .)"/>
  </xsl:template>

  <xsl:template match="@*[matches(., '^-?[.\d]+$')]" mode="name2expression" priority="2">
    <xsl:sequence select="concat('number(','''', ., '''', ')')"/> 
<!--    GREIFT NICHT-->
  </xsl:template>

  <xsl:template match="@*" mode="name2expression">
    <xsl:sequence select="concat('''', ., '''')"/>
  </xsl:template>
</xsl:stylesheet>